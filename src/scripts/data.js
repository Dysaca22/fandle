export function _readGoogleSheet(sheetId, sheetName) {
    return new Promise((resolve, reject) => {
        const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json&sheet=${sheetName}`;
        fetch(url)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
                return response.text();
            })
            .then((data) => {
                const jsonData = JSON.parse(data.substring(47).slice(0, -2));
                const table = jsonData.table;

                const rows = table.rows;

                let headers = [];

                if (
                    table.cols &&
                    table.cols.length &&
                    table.cols.some((col) => col.label)
                ) {
                    headers = table.cols.map((col) => col.label || "");
                } else if (rows.length > 0 && rows[0].c) {
                    headers = rows[0].c.map((cell) => (cell ? cell.v : ""));
                    rows.shift();
                } else {
                    throw new Error("No headers found in the data");
                }

                const dataRows = rows
                    .map((row) => {
                        const rowData = {};
                        headers.forEach((header, index) => {
                            const cell = row.c[index];
                            rowData[header] = cell ? cell.v : "";
                        });
                        return rowData;
                    })
                    .filter((row) =>
                        Object.values(row).some((value) => value !== "")
                    );

                resolve(dataRows);
            })
            .catch((error) => {
                console.error("Error fetching data:", error);
                reject(error);
            });
    });
}

export function prepareData(config, data) {
    if (!config || !data?.length) return [];

    const typeHandlers = {
        int: (val) => parseInt(val) || 0,
        float: (val) => (parseFloat(val) || 0.0).toFixed(1),
        options: (val) => val.split(",").map((option) => option.trim()),
        string: (val) => val?.toString() || "",
    };

    Object.entries(config).forEach(([key, value]) => {
        if (!value || typeof value !== "string") return;
        const handler = typeHandlers[value.toLowerCase()];
        if (!handler) return;

        data.forEach((item) => {
            if (!item?.hasOwnProperty(key)) return;
            try {
                item[key] = handler(item[key]);
            } catch (error) {
                console.error(
                    `Error processing ${key} with value ${item[key]}:`,
                    error
                );
            }
        });
    });
    return data;
}
