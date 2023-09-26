<script>
    function createVisualization() {
      // Define the data structure
      const data = {
        nodes: [
          { id: "Parent-child relationships" },
          { id: "Emotional connection" },
          { id: "Boundaries" },
          // ... add more nodes for other themes and concepts
        ],
        links: [
          { source: "Parent-child relationships", target: "Emotional connection" },
          { source: "Parent-child relationships", target: "Boundaries" },
          // ... add more links to represent connections between themes and concepts
        ],
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
        .force("link", d3.forceLink(data.links).distance(100))
        .force("charge", d3.forceManyBody().strength(-200))
        .force("center", d3.forceCenter(400, 300));

      // Create the links
      const link = svg
        .selectAll("line")
        .data(data.links)
        .enter()
        .append("line");

      // Create the nodes
      const node = svg
        .selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("r", 20)
        .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));

      // Add labels to the nodes
      const label = svg
        .selectAll("text")
        .data(data.nodes)
        .enter()
        .append("text")
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
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
    }

    document.addEventListener("DOMContentLoaded", createVisualization);
  </script>