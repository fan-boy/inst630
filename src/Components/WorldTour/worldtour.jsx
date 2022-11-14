import React, { useState, useRef } from 'react';
import { ReactDOM } from 'react';
import * as d3 from 'd3';
import { useD3 } from '../../hooks/useD3';
import data from '../../data/UFO sightings.json';
import { useEffect } from 'react';
import * as topojson from 'topojson-client';
import { useCanvas } from '../../hooks/useCanvas';

const WorldTour = ({ data }) => {

  // const canvasRef = useRef();
  // const canvasObj = canvasRef.current;
  // const ctx = canvasObj.getContext('2d');
  


const world = d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");

  const land = topojson.feature(world, world.objects.land);
  const borders = topojson.mesh(world, world.objects.countries, (a, b) => a !== b);
  const countries = topojson.feature(world, world.objects.countries).features;

  let sightings = data.sort((a,b) =>{
    return new Date(a.date_time) - new Date(b.date_time);
  });
  let newCountries = [];
  sightings.forEach(p=>{
    if (countries.find(t=> t.properties.name == p.country)){
      newCountries.push({
        ...countries.find(t=> t.properties.name == p.country),
        dateTime:p.date_time
      })
    }
  })
  newCountries = newCountries.filter(p =>  p !== undefined);
  
  // const context = DOM.context2d(window.width, height);
  // const projection = d3.geoOrthographic().fitExtent([[10, 10], [window.width - 10, height - 10]], sphere);
  // const path = d3.geoPath(projection, context);

  debugger;
  
  // const renderData = async() =>{
    
  // }
  
  // renderData();


  const [ coordinates, setCoordinates, canvasRef, canvasWidth, canvasHeight ] = useCanvas();

  const handleCanvasClick=(event)=>{
    // on each click get current mouse location 
    const currentCoord = { x: event.clientX, y: event.clientY };
    // add the newest mouse location to an array in state 
    setCoordinates([...coordinates, currentCoord]);
  };

  const handleClearCanvas=(event)=>{
    setCoordinates([]);
  };

  return (
    <div>
      <canvas 
        className="App-canvas"
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onClick={handleCanvasClick} />

      <div className="button" >
        <button onClick={handleClearCanvas} > CLEAR </button>
      </div>
    </div>
  )

}





export default WorldTour;