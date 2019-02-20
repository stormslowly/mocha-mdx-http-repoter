import React from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter';
import {docco} from 'react-syntax-highlighter/dist/styles/hljs';


export default ({code}) => {
  return <SyntaxHighlighter style={{...docco}} customStyle={{width: '100%', border: '#887dde 2px dashed'}}
                            language="javascript">{code}</SyntaxHighlighter>
}
