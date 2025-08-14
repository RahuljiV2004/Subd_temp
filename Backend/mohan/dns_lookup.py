from flask import Flask, render_template_string, request
import dns.resolver
import dns.reversename

app = Flask(__name__)

HTML_TEMPLATE = """
<!doctype html>
<title>DNS Record Checker</title>
<h2>DNS Record Checker (SPF, DKIM, DMARC, etc.)</h2>
<form method="post">
  <input type="text" name="domain" placeholder="Enter domain or subdomain" required>
  <input type="text" name="selector" placeholder="DKIM selector (optional)">
  <input type="submit" value="Check Records">
</form>
{% if results %}
  <h3>Results for: {{ domain }}</h3>
  <ul>
    {% for record, value in results.items() %}
      <li><strong>{{ record }}</strong>: {{ value }}</li>
    {% endfor %}
  </ul>
{% endif %}
"""

def check_dns_record(domain, record_type):
    try:
        answers = dns_lookup.resolver.resolve(domain, record_type)
        return [r.to_text() for r in answers]
    except Exception:
        return []

def check_txt_record(domain, keyword=None):
    try:
        answers = dns_lookup.resolver.resolve(domain, 'TXT')
        records = []
        for r in answers:
            txt_data = r.to_text().strip('"')
            if not keyword or keyword in txt_data:
                records.append(txt_data)
        return records
    except Exception:
        return []

@app.route("/", methods=["GET", "POST"])
def index():
    results = {}
    domain = None

    if request.method == "POST":
        domain = request.form.get("domain").strip()
        selector = request.form.get("selector", "").strip()

        # A record
        a_records = check_dns_record(domain, 'A')
        results["A record (IPv4)"] = ", ".join(a_records) if a_records else "Not found"

        # AAAA record
        aaaa_records = check_dns_record(domain, 'AAAA')
        results["AAAA record (IPv6)"] = ", ".join(aaaa_records) if aaaa_records else "Not found"

        # MX record
        mx_records = check_dns_record(domain, 'MX')
        results["MX record (Mail)"] = ", ".join(mx_records) if mx_records else "Not found"

        # NS record
        ns_records = check_dns_record(domain, 'NS')
        results["NS record (Nameservers)"] = ", ".join(ns_records) if ns_records else "Not found"

        # CNAME record
        cname_records = check_dns_record(domain, 'CNAME')
        results["CNAME record (Alias)"] = ", ".join(cname_records) if cname_records else "Not found"

        # SOA record
        soa_records = check_dns_record(domain, 'SOA')
        results["SOA record (Start of Authority)"] = ", ".join(soa_records) if soa_records else "Not found"

        # SRV record
        srv_records = check_dns_record(domain, 'SRV')
        results["SRV record (Service)"] = ", ".join(srv_records) if srv_records else "Not found"

        # PTR record (reverse DNS for A record)
        if a_records:
            try:
                rev_name = dns_lookup.reversename.from_address(a_records[0])
                ptr_records = dns_lookup.resolver.resolve(rev_name, 'PTR')
                results["PTR record (Reverse DNS)"] = ", ".join([r.to_text() for r in ptr_records])
            except Exception:
                results["PTR record (Reverse DNS)"] = "Not found"
        else:
            results["PTR record (Reverse DNS)"] = "No A record to check"

        # CAA record
        caa_records = check_dns_record(domain, 'CAA')
        results["CAA record (CA Authorization)"] = ", ".join(caa_records) if caa_records else "Not found"

        # SPF record (TXT containing v=spf1)
        spf_records = check_txt_record(domain, 'v=spf1')
        results["SPF record"] = ", ".join(spf_records) if spf_records else "Not found"

        # DMARC record (_dmarc.domain)
        dmarc_domain = f"_dmarc.{domain}"
        dmarc_records = check_txt_record(dmarc_domain, 'v=DMARC1')
        results["DMARC record"] = ", ".join(dmarc_records) if dmarc_records else "Not found"

        # DKIM record (selector._domainkey.domain)
        if selector:
            dkim_domain = f"{selector}._domainkey.{domain}"
            dkim_records = check_txt_record(dkim_domain)
            results["DKIM record"] = ", ".join(dkim_records) if dkim_records else "Not found"
        else:
            results["DKIM record"] = "Not checked (selector not provided)"

        # All TXT records (generic)
        txt_records = check_txt_record(domain)
        results["All TXT records"] = ", ".join(txt_records) if txt_records else "Not found"

    return render_template_string(HTML_TEMPLATE, results=results, domain=domain)

if __name__ == "__main__":
    app.run(debug=True)