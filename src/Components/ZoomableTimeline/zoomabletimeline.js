import React from 'react';
import * as d3 from 'd3';

const ZoomableTimeline = () =>{

    const MS_PER_YEAR = 31556736000;
    const MS_PER_HOUR = 3600000;
    const MS_PER_DAY = 86400000;

    const margin = {
    top: 80,
    right: 20,
    bottom: 20,
    left: 20
  }

  const zoomScaleExtent =[1,121];
  const days = 3653;

  const scaleX = () =>{
    {
        function getDate(date) {
          return new Date(date.toISOString().split('T')[0]);
        }
      
        const now = new Date();
        const until = new Date(years * MS_PER_YEAR + now.getTime()); 
      
        const nowDate = getDate(now);
        const untilDate = getDate(until);
        
        const timeScale = d3.scaleUtc().domain([nowDate, untilDate]).range([margin.left, width - margin.right]);
      
        return timeScale;
      }
  }

  function zoomPlugin(svg, zoomed) {
    const zoom = d3.zoom()
      .scaleExtent(zoomScaleExtent)
      .extent([[margin.left, 0], [width - margin.right, 0]])
      .translateExtent([
        [margin.left, 0],
        [width - margin.right, 0]
      ])
      .filter(filter)
      .on("zoom", zoomed);
   
    svg.call(zoom);
  
    function reset() {
      svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);
    }
  
    // prevent scrolling then apply the default filter
    function filter(event) {
      event.preventDefault();
      return (!event.ctrlKey || event.type === 'wheel') && !event.button;
    }
  
    return {
      zoom,
      reset
    };
  }


  const getDays = (a,b) =>{
    return Math.abs(a - b) / MS_PER_DAY;
  }

  function Timeline(scaleX, margin, height = 200) {
    let axis = {};
    let nodes = {};
  
    let originalScaleX = scaleX.copy();
  
    const parts = ["yearly", "daily", "weekly", "grid", "yearlyGrid"];
  
    const findDensityConfig = (map, value) => {
      for (const [limit, config] of map) {
        if (value < limit) {
          return config;
        }
      }
  
      return [];
    };
  
    const ensureTimeFormat = (value = "") => {
      return typeof value !== "function" ? d3.utcFormat(value) : value;
    };
  
    axis["yearly"] = (parentNode, density) => {
      const densityMap = [
        [
          3,
          [
            d3.utcMonth,
            (d) => {
              const startOfTheYear =
                d.getUTCMonth() === 0 && d.getUTCDate() === 1;
              const format = startOfTheYear ? "%Y – %B" : "%B";
  
              return d3.utcFormat(format)(d);
            },
          ],
        ],
        [Infinity, [d3.utcYear, "%Y"]],
      ];
  
      let [interval, format] = findDensityConfig(densityMap, density);
      format = ensureTimeFormat(format);
  
      const el = parentNode
        .attr("transform", `translate(0,${margin.top - 48})`)
        .call(
          d3
            .axisTop(scaleX)
            .ticks(interval)
            .tickFormat(format)
            .tickSizeOuter(0)
        );
  
      el.select(".domain").remove();
  
      el.selectAll("text")
        .attr("y", 0)
        .attr("x", 6)
        .style("text-anchor", "start");
  
      el.selectAll("line").attr("y1", -7).attr("y2", 6);
    };
  
    axis["daily"] = (parentNode, density) => {
      const densityMap = [
        [1, [d3.utcDay, "%-d"]],
        [3, [d3.utcDay, ""]],
        [8, [d3.utcMonth, "%B"]],
        [13, [d3.utcMonth, "%b"]],
        [22, [d3.utcMonth, (d) => d3.utcFormat("%B")(d).charAt(0)]],
        [33, [d3.utcMonth.every(3), "Q%q"]],
        [Infinity, [d3.utcMonth.every(3), ""]],
      ];
  
      let [interval, format] = findDensityConfig(densityMap, density);
      format = ensureTimeFormat(format);
  
      const el = parentNode
        .attr("transform", `translate(0,${margin.top - 28})`)
        .call(
          d3
            .axisTop(scaleX)
            .ticks(interval)
            .tickFormat(format)
            .tickSizeOuter(0)
        );
  
      el.select(".domain").remove();
  
      el.selectAll("text")
        .attr("y", 0)
        .attr("x", 6)
        .style("text-anchor", "start");
  
      el.selectAll("line").attr("y1", -7).attr("y2", 0);
    };
  
    axis["weekly"] = (parentNode, density) => {
      const densityMap = [
        [10, [d3.timeMonday, (d) => +d3.utcFormat("%-W")(d) + 1]],  // monday as first of week and zero based
        [33, [d3.timeMonday, ""]],
        [Infinity, [d3.timeMonday.every(4), ""]],
      ];
  
      let [interval, format] = findDensityConfig(densityMap, density);
      format = ensureTimeFormat(format);
  
      const el = parentNode
        .attr("transform", `translate(0,${margin.top - 8})`)
        .call(
          d3
            .axisTop(scaleX)
            .ticks(interval)
            .tickFormat(format)
            .tickSizeOuter(0)
        );
  
      el.select(".domain").remove();
      el.selectAll("line").style(
        "visibility",
        density > densityMap[0][0] ? "visible" : "hidden"
      );
  
      el.selectAll("text")
        .attr("y", 0)
        .attr("x", 6)
        .style("text-anchor", "start");
  
      el.selectAll("line").attr("y1", -7).attr("y2", 0);
    };
  
    axis["grid"] = (parentNode, density) => {
      const densityMap = [
        [1, [d3.utcDay]],
        [8, [d3.timeMonday]],
        [22, [d3.utcMonth]],
        [Infinity, [d3.utcMonth.every(3)]],
      ];
  
      const [interval] = findDensityConfig(densityMap, density);
  
      const el = parentNode
        .attr("transform", `translate(0,${margin.top})`)
        .call(d3.axisTop(scaleX).ticks(interval).tickSizeOuter(0));
  
      el.select(".domain").remove();
      el.selectAll("text").remove();
  
      el.selectAll("line")
        .attr("y1", 0)
        .attr("y2", height - margin.top - margin.bottom);
    };
  
    axis["yearlyGrid"] = (parentNode, density) => {
      const densityMap = [
        [3, [d3.utcMonth, "%B"]],
        [Infinity, [d3.utcYear, "%Y"]],
      ];
  
      let [interval, format] = findDensityConfig(densityMap, density);
      format = ensureTimeFormat(format);
  
      const el = parentNode
        .attr("transform", `translate(0,${margin.top})`)
        .call(
          d3
            .axisTop(scaleX)
            .ticks(interval)
            .tickFormat(format)
            .tickSizeOuter(0)
        );
  
      el.select(".domain").remove();
      el.selectAll("text").remove();
  
      el.selectAll("line")
        .attr("y1", 0)
        .attr("y2", height - margin.top - margin.bottom);
    };
  
    const setup = () => {
      const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");
  
      const element = svg.node();
      
      const rootNode = svg.append("g").classed("timeline-axis", true);
  
      parts.forEach((part) => {
        nodes[part] = rootNode.append("g").classed(part, true);
      });
  
      const update = () => {
        // NOTE: Not used atm.
        // const [startDate, endDate] = scaleX.domain();
        // const totalVisibleDays = Math.abs(startDate - endDate) / MS_PER_DAY;
  
        const density =
          Math.abs(scaleX.invert(0) - scaleX.invert(1)) / MS_PER_HOUR; // in pixels per hour
  
        parts.forEach((part) => {
          nodes[part].call(axis[part], density);
        });
      };
  
      const { zoom, reset } = zoomPlugin(svg,
        ({ transform }) => {
          scaleX = transform.rescaleX(originalScaleX);
          
          update();
        }
      );
  
      update();
  
      return {
        element,
        update,
        reset,
      };
    };
  
    return setup();
  }

}

export default ZoomableTimeline;