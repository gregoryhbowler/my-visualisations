function createVisualization() {
  console.log("Creating visualization...");

 // Define the data structure
const centerX = 400;
const centerY = 300;
const radius = 200;


let positiveAttributes = Array.from({ length: 5 }, (_, i) => {
  const angle = (2 * Math.PI * i) / 10;
  return {
      id: `Positive Attribute ${i + 1}`,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
  };
});

let negativeAttributes = Array.from({ length: 5 }, (_, i) => {
  const angle = (2 * Math.PI * (i + 10)) / 20;
  return {
      id: `Negative Attribute ${i + 1}`,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
  };
});

let data = {
  nodes: [{ id: "You", fx: centerX, fy: centerY }].concat(positiveAttributes, negativeAttributes),
  links: []
};


let numOtherNodes = data.nodes.length - 1;  // Exclude the "You" node
data.nodes.forEach((node, i) => {
  if (node.id === "You") return;

  const spread = 800 / (numOtherNodes + 1);
  node.y = 550; // position nodes near the bottom of SVG
  node.x = spread * (i + 1); // i+1 so we don't start from the edge
});



  // Create the SVG container for the visualization

  const width = window.innerWidth;
  const height = window.innerHeight;

  const svg = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const linkGroup = svg.append("g").attr("class", "links");
const nodeGroup = svg.append("g").attr("class", "nodes");
const labelGroup = svg.append("g").attr("class", "labels");

let link = linkGroup.selectAll("line").data(data.links);
let node = nodeGroup.selectAll("circle").data(data.nodes);
let label = labelGroup.selectAll("text").data(data.nodes);


  // Create a force simulation
  const simulation = d3
  .forceSimulation(data.nodes)
  .force("link", d3.forceLink(data.links).distance(40).id((d) => d.id))
  .force("charge", d3.forceManyBody().strength(-50))
  .force("collide", d3.forceCollide(50))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("maintainDistance", (alpha) => maintainFixedDistance(alpha, data))
  .force("x", d3.forceX((d) => {
      if (d.id === "You") return 600;
      if (!d.fx) return d.x;
      const diffX = d.x - centerX;
      const diffY = d.y - centerY;
      const angle = Math.atan2(diffY, diffX);
      return centerX + radius * Math.cos(angle);
  }).strength(0.3))
  .force("y", d3.forceY((d) => {
      if (d.id === "You") return 300;
      if (!d.fx) return d.y;
      const diffX = d.x - centerX;
      const diffY = d.y - centerY;
      const angle = Math.atan2(diffY, diffX);
      return centerY + radius * Math.sin(angle);
  }).strength(0.3));
  simulation.force("box", boxForce(0, 0, width, height, simulation));
  simulation.alphaDecay(0.1);  // Adjust the rate at which the current alpha value decreases
simulation.velocityDecay(0.6); // Increase the rate of decay for node velocities



  // Create the links
  link = linkGroup

    .selectAll("line")
    .data(data.links)
    .join("line")
    .attr("stroke-width", 2);

  // Add labels to the nodes
  label = labelGroup
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

    node.attr("cx", d => d.x).attr("cy", d => d.y);

    label
        .attr("x", d => {
            if (d.x > centerX) {
                return d.x + 25;  // Adjust the offset as needed
            } else {
                return d.x - 25;  // Adjust the offset as needed
            }
        })
        .attr("y", d => {
            if (d.y > centerY) {
                return d.y + 10;  // Adjust the offset as needed
            } else {
                return d.y - 10;  // Adjust the offset as needed
            }
        });
});

  // Define drag event handlers

  function dragged(event, d) {
      const padding = 20;
      if (d.id !== "You") {
          d.x = d.fx = Math.max(padding, Math.min(800 - padding, event.x));
          d.y = d.fy = Math.max(padding, Math.min(600 - padding, event.y));

           // Update the position of the dragged node immediately
           d3.select(this)
          .attr("cx", d.x)
          .attr("cy", d.y);

                // Update the links connected to the dragged node immediately
          link
          .filter(link => link.source === d || link.target === d)
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

          // After setting the position of the dragged node, invoke the custom force to adjust the position of outcome nodes
          maintainFixedDistance(1,data);
          
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
          (d.id.startsWith("Positive") || d.id.startsWith("Negative"))
          && distance <= threshold
      ) {
          const angleOffset = Math.PI / (data.links.length + 1);
          data.links.forEach((link, index) => {
              if (link.source.id === "You") {
                  const angle = angleOffset * index;
                  link.target.fx = centerX + (radius * Math.cos(angle));
                  link.target.fy = centerY + (radius * Math.sin(angle));
              }
          });
  
          // Add associated outcomes and update the visualization
          addAssociatedOutcomes(d, youNode);
      } else {
          // If the dragged node is not close enough to the "You" node, update the visualization without adding outcomes
          updateVisualization();
      }
  }

  function addAssociatedOutcomes(source, target) {
      // Attach the attribute node to the "You" node
      data.links.push({ source: target, target: source });
    
      // Add 2 outcome nodes for each attribute
      for (let i = 1; i <= 2; i++) {
        const outcomeId = `${source.id} Outcome ${i}`;
        if (!data.nodes.find((node) => node.id === outcomeId)) {
          data.nodes.push({ id: outcomeId });
          data.links.push({ source: source, target: outcomeId });
        }
      }
    
      // Update the visualization with the new nodes and links
      updateVisualization();
    }

    function updateVisualization() {
      // Update the links
      link = linkGroup
      .selectAll("line")
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
          (enter) => enter
            .append("circle")
            .attr("r", 20)
            .attr("fill", (d) => (d.id === "You" ? "#69b3a2" : "#ff7f50"))
            .attr("cx", (d) => d.x || (d.x = Math.random() * 800))
            .attr("cy", (d) => d.y || (d.y = Math.random() * 600))
            .call(
              d3
                .drag()
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

    updateVisualization();


  console.log("Visualization created.");
}

function boxForce(x1, y1, x2, y2, simulation) {
  return (alpha) => {
      const nodes = simulation.nodes(); // directly get the nodes from the simulation
      const padding = 20;
      for (let i = 0, n = nodes.length; i < n; ++i) {
          const node = nodes[i];

          // Check if node is outside the box and reposition it if necessary
          if (node.x < x1 + padding) node.x = x1 + padding;
          if (node.x > x2 - padding) node.x = x2 - padding;
          if (node.y < y1 + padding) node.y = y1 + padding;
          if (node.y > y2 - padding) node.y = y2 - padding;
      }
  };
}

function maintainFixedDistance(alpha, data) {
  const distance = 50;  // The desired distance between attribute and outcome nodes
  const damping = 0.5; // new damping factor

  data.links.forEach(link => {
      if (link.source.id.startsWith("Positive") || link.source.id.startsWith("Negative")) {
          const attributeNode = link.source;
          const outcomeNode = link.target;
          
          const dx = outcomeNode.x - attributeNode.x;
          const dy = outcomeNode.y - attributeNode.y;
          
          const length = Math.sqrt(dx * dx + dy * dy);
          
          if (length === 0) return;  // Avoid division by zero

          const lx = (dx / length) * distance;
          const ly = (dy / length) * distance;

          outcomeNode.x = attributeNode.x + lx;
          outcomeNode.y = attributeNode.y + ly;
      }
  });
}


document.addEventListener("DOMContentLoaded", createVisualization);
