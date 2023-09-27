function createVisualization() {
    console.log("Creating visualization...");
  
    // Define the data structure
    let data = {
      nodes: [
        { id: "You", fx: 400, fy: 300 },
        { id: "Positive Attribute 1", x: 200, y: 550 },
        { id: "Positive Attribute 2", x: 400, y: 550 },
        { id: "Negative Attribute 1", x: 600, y: 550 },
        { id: "Negative Attribute 2", x: 800, y: 550 },
        // ... add more attributes as needed
      ],
      links: [],
    };
  
    // Create the SVG container for the visualization
    const svg = d3
      .select("body")
      .append("svg")
      .attr("width", 800)
      .attr("height", 600);
  
    // Create a force simulation
    const simulation = d3
      .forceSimulation(data.nodes)
      .force("link", d3.forceLink(data.links).distance(100).id((d) => d.id))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(400, 400))
      .force("box", boxForce(0, 0, 800, 800));
  
    // Create the links
    let link = svg
      .selectAll("line")
      .data(data.links)
      .join("line")
      .attr("stroke-width", 2);
  
    // Create the nodes
    let node = svg
      .selectAll("circle")
      .data(data.nodes)
      .join("circle")
      .attr("r", 20)
      .attr("fill", (d) => (d.id === "You" ? "#69b3a2" : "#ff7f50"))
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );
  
    // Add labels to the nodes
    let label = svg
      .selectAll("text")
      .data(data.nodes)
      .join("text")
      .text((d) => d.id);
  
    // Update the positions of the nodes and links during the simulation
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);
  
      node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
  
      label.attr("x", (d) => d.x).attr("y", (d) => d.y);
    });
  
    // Define drag event handlers
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      if (d.id !== "You") {
        d.fx = d.x;
        d.fy = d.y;
      }
    }
  
    function dragged(event, d) {
      if (d.id !== "You") {
        d.fx = event.x;
        d.fy = event.y;
      }
    }
  
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      if (d.id !== "You") {
        d.fx = null;
        d.fy = null;
      }
  
      // Check if the dragged node is an attribute and is close enough to the "You" node
      const youNode = data.nodes.find((node) => node.id === "You");
      const distance = Math.sqrt(
        Math.pow(d.x - youNode.x, 2) + Math.pow(d.y - youNode.y, 2)
      );
      const threshold = 80; // Adjust this value as needed
  
      if (
        (d.id.startsWith("Positive") || d.id.startsWith("Negative")) &&
        distance <= threshold
      ) {
 
        // Add associated outcomes and update the visualization
        addAssociatedOutcomes(d, youNode);
      } else {
        // If the dragged node is not close enough to the "You" node, update the visualization without adding outcomes
        updateVisualization();
      }
    }
  
    function addAssociatedOutcomes(source, target) {
      // Define the associated outcomes for each attribute
      const positiveOutcomes = [
        { id: "Positive Outcome 1" },
        { id: "Positive Outcome 2" },
        // ... add more positive outcomes as needed
      ];
  
      const negativeOutcomes = [
        { id: "Negative Outcome 1" },
        { id: "Negative Outcome 2" },
        // ... add more negative outcomes as needed
      ];
  
      // Add the associated outcomes based on the connected attribute
      if (source.id.startsWith("Positive")) {
        positiveOutcomes.forEach((outcome) => {
          data.nodes.push(outcome);
          data.links.push({ source: target, target: outcome });
        });
      } else if (source.id.startsWith("Negative")) {
        negativeOutcomes.forEach((outcome) => {
          data.nodes.push(outcome);
          data.links.push({ source: target, target: outcome });
        });
      }
  
      // Update the visualization with the new nodes and links
      updateVisualization();
    }
  
    function updateVisualization() {
      // Update the links
      link = link
        .data(data.links)
        .join(
          (enter) => enter.append("line").attr("stroke-width", 2),
          (update) => update,
          (exit) => exit.remove()
        );
  
      // Update the nodes
      node = node
        .data(data.nodes)
        .join(
          (enter) =>
            enter
              .append("circle")
              .attr("r", 20)
              .attr("fill", (d) => (d.id === "You" ? "#69b3a2" : "#ff7f50"))
              .call(
                d3
                  .drag()
                  .on("start", dragstarted)
                  .on("drag", dragged)
                  .on("end", dragended)
              ),
          (update) => update,
          (exit) => exit.remove()
        );
  
      // Update the labels
      label = label
        .data(data.nodes)
        .join(
          (enter) => enter.append("text").text((d) => d.id),
          (update) => update,
          (exit) => exit.remove()
        );
  
      // Restart the simulation with the new data
      simulation.nodes(data.nodes).force("link").links(data.links);
      simulation.alpha(1).restart();
    }
  
    console.log("Visualization created.");
  }

  function boxForce(x1, y1, x2, y2) {
    return (alpha) => {
      for (let i = 0, n = data.nodes.length; i < n; ++i) {
        const node = data.nodes[i];
        node.x = Math.max(x1 + 20, Math.min(x2 - 20, node.x));
        node.y = Math.max(y1 + 20, Math.min(y2 - 20, node.y));
      }
    };
  }
  
  document.addEventListener("DOMContentLoaded", createVisualization);
