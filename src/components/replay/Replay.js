import React, { Component } from 'react';
import MonacoEditor from 'react-monaco-editor';
import cursor from './cursor.png';

export default class Replay extends React.Component {
    constructor(props) {
     super(props);
     this.state = {
       currEvent: undefined,
       currMouse: undefined,
       playing: false,
       timeouts: [],
       started: false
     }
   }

   editorDidMount = (editor, monaco) => {
     this.editor = editor;
     editor.focus();
   }

   startReplay = () => {
     this.setState({
       playing: true,
       started: true
     })
     let array = JSON.parse(window.localStorage.array)
     let firstEvent = this.state.currEvent
     if (!firstEvent) {
       firstEvent = array[0]
     }
     this.setState({
       value: firstEvent.value
     })
     for (var i = 1; i < array.length; i++) {
       let event = array[i]
       this.setState({
         timeouts: this.state.timeouts.concat(setTimeout(() => {
           if (this.state.playing) {
             this.setState({
               value: event.value,
               currEvent: event
             })
           }
         },event.timestamp - firstEvent.timestamp))
       })
     }

     let editorStates = JSON.parse(window.localStorage.editorStates)
     console.log(editorStates)
     for (var i = 0; i < editorStates.length; i++) {
       this.setState({
         timeouts: window.setTimeout((i) => {
           console.log(editorStates[i], i)
           console.log(this.editor.restoreViewState)
           this.editor.restoreViewState(editorStates[i])
         }, i * 1000, i)
       })
     }

     let mouseArray = JSON.parse(window.localStorage.mouseArray)
     let firstMouseEvent = this.state.currMouse
     if (!firstMouseEvent) {
       firstMouseEvent = mouseArray[0]
     }
     this.setState({
       cx:firstMouseEvent.cx,
       cy:firstMouseEvent.cy
     })
     for (var i = 1; i < mouseArray.length; i++) {
       let mouseEvents=mouseArray[i]
       this.setState({
         timeouts: this.state.timeouts.concat(setTimeout(()=>{
           if (this.state.playing) {
             this.setState({
               cx:mouseEvents.cx,
               cy:mouseEvents.cy,
               currMouse: mouseEvents
             })
           }
         },mouseEvents.timestamp - firstMouseEvent.timestamp)
        )
       })
     }
   }

   stop = () => {
     this.setState({
       playing: false
     })
     for (var i = 0; i < this.state.timeouts.length; i++) {
       window.clearTimeout(this.state.timeouts[i])
     }
   }

   resume = () => {
     this.setState({
       playing: true,
       timeouts: []
     })
     this.startReplay()
   }

   render() {
    const requireConfig = {
       url: 'https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.1/require.min.js',
       paths: {
         'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.12.0/min/vs'
       }
     }
    const code = this.state.code;
    const options = {
      selectOnLineNumbers: true
    };

    return (
      <div>
      <MonacoEditor
           height={600}
           width={window.innerWidth}
           language='javascript'
           theme='vs-dark'
           value={this.state.value}
           options={options}
           editorDidMount={this.editorDidMount}
           requireConfig={requireConfig}
           events={this.events}
           onChange={this.onChange}
           onMouseMove={this.onMouseMove}
         />
         <img src={cursor} className="App-cursor"
            style={{ width:'15px', position: 'absolute', left :this.state.cx +'px', top:this.state.cy +'px'}}
         />
         <button onClick={this.startReplay}> Replay </button>
         {
          (this.state.playing) &&
          <button onClick={this.stop}> pause </button>
         }
         {
           !this.state.playing && this.state.started &&
           <button onClick={this.resume}> resume </button>
         }
      </div>
    );
  }
}
