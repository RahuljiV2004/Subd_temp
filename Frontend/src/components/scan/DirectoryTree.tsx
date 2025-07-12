import React from "react";

interface FFUFResultSectionProps {
  ffufResults: string[];
  baseUrl: string; // e.g., "https://sub.example.com"
}

// Parse the FFUF result strings into structured format
const parseFFUF = (lines: string[]) => {
  return lines.map((line) => {
    const [pathPart, statusPart] = line.split(" [Status: ");
    const status = statusPart?.replace("]", "") || "";
    const parts = pathPart.split("/").filter(Boolean);
    return { fullPath: pathPart, parts, status };
  });
};

const FFUFResultSection: React.FC<FFUFResultSectionProps> = ({
  ffufResults,
  baseUrl,
}) => {
  const cleanedBaseUrl = baseUrl.replace(/\/$/, ""); // ensure no trailing slash

  return (
    <div className="modal-section">
      <br />
      <h3 className="modal-section-title text-green-500 text-xl font-bold">
        &gt;&gt; Directory Bruteforce Results (FFUF)
      </h3>

      <div className="modal-section-content">
        <div className="modal-grid-item md:col-span-2">
          <div className="modal-grid-label text-[#BF40BF] text-lg font-mono">
            FFUF Matches
          </div>
          <div className="modal-grid-value text-primary flex flex-col gap-1 mt-2">
            {Array.isArray(ffufResults) && ffufResults.length > 0 ? (
              parseFFUF(ffufResults).map(({ fullPath, parts, status }, idx) => {
                const isFolder = fullPath.endsWith("/");
                const depth = parts.length - 1;

                const colorClass =
                  status === "200"
                    ? "text-green-400"
                    : status === "301"
                    ? "text-yellow-400"
                    : "text-gray-400";

                const cleanPath = fullPath.replace(/\/$/, ""); // remove trailing slash
                const fullURL = `${cleanedBaseUrl}/${cleanPath}`;

                return (
                  <div
                    key={idx}
                    style={{ paddingLeft: `${depth * 1.25}rem` }}
                    className={`py-1 flex items-center text-sm font-mono ${colorClass}`}
                  >
                    <span className="mr-2">{"📁" }</span>
                    <a
                      href={fullURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {fullPath}{" "}
                      <span className="text-xs opacity-60 ml-1">
                        ({status})
                      </span>
                    </a>
                  </div>
                );
              })
            ) : (
              <span className="text-gray-400 text-sm">N/A</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FFUFResultSection;
