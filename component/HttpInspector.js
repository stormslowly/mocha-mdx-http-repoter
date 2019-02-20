import React from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter';

export default ({http}) => {
  return <div>
    <ul style={{listStyle: 'none', margin: 0, padding: 0}}>

      {http.map((rr, i) => {
        return <li key={i} style={{overflow: "scroll"}}>
          <SyntaxHighlighter language={"http"}>
            {
              `${rr.method} ${rr.path}
${Object.keys(rr.reqheaders).map((key) => {
                return `${key}: ${rr.reqheaders[key]}`
              }).join('\n')}

${rr.method === "GET" ? '' : JSON.stringify(rr.body, null, ' ')}`}
          </SyntaxHighlighter>

          <SyntaxHighlighter>
            {JSON.stringify(rr.response, null, ' ')}
          </SyntaxHighlighter>

        </li>
      })}
    </ul>

  </div>
}
