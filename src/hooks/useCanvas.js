

import React, { useState, useEffect, useRef } from 'react';
import data from '../data/UFO sightings.json';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
// Path2D for a Heart SVG
const heartSVG = "M0 200 v-200 h200 a100,100 90 0,1 0,200 a100,100 90 0,1 -200,0 z"
const SVG_PATH = new Path2D(heartSVG);

// Scaling Constants for Canvas
const SCALE = 0.1;
const OFFSET = 80;
export const canvasWidth = window.innerWidth * .5;
export const canvasHeight = window.innerHeight * .5;

export function draw(ctx, location) {
    console.log("attempting to draw")
    ctx.fillStyle = 'red';
    ctx.shadowColor = 'blue';
    ctx.shadowBlur = 15;
    ctx.save();
    ctx.scale(SCALE, SCALE);
    ctx.translate(location.x / SCALE - OFFSET, location.y / SCALE - OFFSET);
    ctx.rotate(225 * Math.PI / 180);
    ctx.fill(SVG_PATH);
    // .restore(): Canvas 2D API restores the most recently saved canvas state
    ctx.restore();
};


export function useCanvas() {
    const canvasRef = useRef(null);
    const world = d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
    const land = topojson.feature(world, world.objects.land);
    const borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b)
    const countries = topojson.feature(world, world.objects.countries).features;
    const sphere = {
        type: "Sphere"
    };
    const tilt = 20;
    const height = Math.min(window.innerWidth, 720);
    let name = "";
    let stats = "";
    let sightings = data.sort((a, b) => {
        return new Date(a.date_time) - new Date(b.date_time);
    })

    let newCountries = [];;
  sightings.forEach(p=>{
    if (countries.find(t=> t.properties.name == p.country)){
      newCountries.push({
        ...countries.find(t=> t.properties.name == p.country),
        dateTime:p.date_time
      })
    }
  })
   newCountries = newCountries.filter(p => p!== undefined);


    const [coordinates, setCoordinates] = useState([]);


    class Versor {
        static fromAngles([l, p, g]) {
          l *= Math.PI / 360;
          p *= Math.PI / 360;
          g *= Math.PI / 360;
          const sl = Math.sin(l), cl = Math.cos(l);
          const sp = Math.sin(p), cp = Math.cos(p);
          const sg = Math.sin(g), cg = Math.cos(g);
          return [
            cl * cp * cg + sl * sp * sg,
            sl * cp * cg - cl * sp * sg,
            cl * sp * cg + sl * cp * sg,
            cl * cp * sg - sl * sp * cg
          ];
        }
        static toAngles([a, b, c, d]) {
          return [
            Math.atan2(2 * (a * b + c * d), 1 - 2 * (b * b + c * c)) * 180 / Math.PI,
            Math.asin(Math.max(-1, Math.min(1, 2 * (a * c - d * b)))) * 180 / Math.PI,
            Math.atan2(2 * (a * d + b * c), 1 - 2 * (c * c + d * d)) * 180 / Math.PI
          ];
        }
        static interpolateAngles(a, b) {
          const i = Versor.interpolate(Versor.fromAngles(a), Versor.fromAngles(b));
          return t => Versor.toAngles(i(t));
        }
        static interpolateLinear([a1, b1, c1, d1], [a2, b2, c2, d2]) {
          a2 -= a1; 
          b2 -= b1;
          c2 -= c1;
          d2 -= d1;
          const x = new Array(4);
          return t => {
            const l = Math.hypot(x[0] = a1 + a2 * t, x[1] = b1 + b2 * t, x[2] = c1 + c2 * t, x[3] = d1 + d2 * t);
            x[0] /= l; 
            x[1] /= l;
            x[2] /= l;
            x[3] /= l;
            return x;
          };
        }
        static interpolate([a1, b1, c1, d1], [a2, b2, c2, d2]) {
          let dot = a1 * a2 + b1 * b2 + c1 * c2 + d1 * d2;
          if (dot < 0) {
            a2 = -a2;
             b2 = -b2; 
             c2 = -c2;
             d2 = -d2;
             dot = -dot;
            }
          if (dot > 0.9995) return Versor.interpolateLinear([a1, b1, c1, d1], [a2, b2, c2, d2]); 
          const theta0 = Math.acos(Math.max(-1, Math.min(1, dot)));
          const x = new Array(4);
          const l = Math.hypot(a2 -= a1 * dot, b2 -= b1 * dot, c2 -= c1 * dot, d2 -= d1 * dot);
          a2 /= l; 
          b2 /= l; 
          c2 /= l;
          d2 /= l;
          return t => {
            const theta = theta0 * t;
            const s = Math.sin(theta);
            const c = Math.cos(theta);
            x[0] = a1 * c + a2 * s;
            x[1] = b1 * c + b2 * s;
            x[2] = c1 * c + c2 * s;
            x[3] = d1 * c + d2 * s;
            return x;
          };
        }
      }
    
    useEffect(() => {
        (async() =>{
        const canvasObj = canvasRef.current;
        const ctx = canvasObj.getContext('2d');
        const projection = d3.geoOrthographic().fitExtent([[10, 10], [window.width - 10, height - 10]], sphere);
  const path = d3.geoPath(projection, ctx);
   async function render(context,country, arc) {
    context.clearRect(0, 0, window.width, height);
    context.beginPath(); path(land); context.fillStyle = "#ccc"; context.fill();
    context.beginPath(); path(country); context.fillStyle = "#f00"; context.fill();
    context.beginPath(); path(borders); context.strokeStyle = "#fff"; context.lineWidth = 0.5; context.stroke();
    context.beginPath(); path(sphere); context.strokeStyle = "#000"; context.lineWidth = 1.5; context.stroke();
    context.beginPath(); path(arc); context.stroke();
    return context.canvas;
  }
        // clear the canvas area before rendering the coordinates held in state
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        // draw all coordinates held in state
        let p1, p2 = [0, 0], r1, r2 = [0, 0, 0];
  for (const country of newCountries) {
    name = country.properties.name;
    await render(ctx,country);

    p1 = p2; p2 = d3.geoCentroid(country);
    r1 = r2; r2 = [-p2[0], tilt - p2[1], 0];
    const ip = d3.geoInterpolate(p1, p2);
    const iv = Versor.interpolateAngles(r1, r2);

    await d3.select(canvasRef.current).
    transition()
        .duration(1250)
        .tween("render", () => t => {
          projection.rotate(iv(t));
          render(ctx,country, {type: "LineString", coordinates: [p1, ip(t)]});
        })
      .transition()
        .tween("render", () => t => {
          render(ctx,country, {type: "LineString", coordinates: [ip(t), p2]});
        })
      .end();
  }
})()
    });

    return [coordinates, setCoordinates, canvasRef, canvasWidth, canvasHeight];
}
