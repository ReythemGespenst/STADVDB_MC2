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