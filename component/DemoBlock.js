import React from 'react'
import HttpInspector from "./HttpInspector";
import Snippet from "./Snippet";

export default ({code, http}) => {


  return <div style={{display: "flex", justifyContent: "space-between"}}>

    <div style={{display: "flex", flex: 1}}>
      <Snippet code={code}/>
    </div>

    <div style={{display: "flex", flex: 1, overflow: 'scroll'}}>
      <HttpInspector http={http}></HttpInspector>
    </div>
  </div>

}
