export class HistoryManager {
  constructor(limit=30){ this.limit=limit; this.undoStack=[]; this.redoStack=[]; this.locked=false; }
  push(state){
    if(this.locked) return;
    const text=JSON.stringify(state);
    if(this.undoStack.at(-1)===text) return;
    this.undoStack.push(text);
    if(this.undoStack.length>this.limit) this.undoStack.shift();
    this.redoStack=[];
  }
  undo(current){
    if(this.undoStack.length<2) return null;
    this.redoStack.push(JSON.stringify(current));
    this.undoStack.pop();
    return JSON.parse(this.undoStack.at(-1));
  }
  redo(current){
    const next=this.redoStack.pop();
    if(!next) return null;
    this.undoStack.push(next);
    return JSON.parse(next);
  }
  reset(state){ this.undoStack=[JSON.stringify(state)]; this.redoStack=[]; }
}
