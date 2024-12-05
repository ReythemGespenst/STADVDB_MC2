function redirectToNode(nodeId) {
    // Redirect to the corresponding node page
    let nodeDetails = {
        node1: { title: "Node 1: Central Node (All Data)", details: "IP: 192.168.1.1 | Port: 8080" },
        node2: { title: "Node 2: Games Released < 2010", details: "IP: 192.168.1.2 | Port: 8081" },
        node3: { title: "Node 3: Games Released >= 2010", details: "IP: 192.168.1.3 | Port: 8082" }
    };

    // Pass data dynamically to the node page
    sessionStorage.setItem("nodeTitle", nodeDetails[nodeId].title);
    sessionStorage.setItem("nodeDetails", nodeDetails[nodeId].details);

    window.location.href = "node.html";
}

// Load node information dynamically on node.html
document.addEventListener("DOMContentLoaded", () => {
    const nodeTitle = sessionStorage.getItem("nodeTitle");
    const nodeDetails = sessionStorage.getItem("nodeDetails");

    if (nodeTitle && nodeDetails) {
        document.getElementById("node-title").textContent = nodeTitle;
        document.getElementById("node-details").textContent = nodeDetails;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    fetch('http://localhost:3000/api/tables')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('database-structure');
            for (const [tableName, columns] of Object.entries(data)) {
                const tableDiv = document.createElement('div');
                tableDiv.classList.add('table');

                const tableTitle = document.createElement('h3');
                tableTitle.textContent = `Table: ${tableName}`;
                tableDiv.appendChild(tableTitle);

                const columnList = document.createElement('ul');
                columns.forEach(column => {
                    const columnItem = document.createElement('li');
                    columnItem.textContent = `${column.column} (${column.type})`;
                    columnList.appendChild(columnItem);
                });

                tableDiv.appendChild(columnList);
                container.appendChild(tableDiv);
            }
        })
        .catch(error => {
            console.error('Error fetching database structure:', error);
        });
});
