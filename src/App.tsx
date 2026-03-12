
import TopBar from './components/layout/TopBar'
import LeftPanel from './components/layout/LeftPanel'
import RightPanel from './components/layout/RightPanel'
import CanvasStage from './components/canvas/CanvasStage'
import TimelineDock from './components/layout/TimelineDock'

export default function App(){
  return (
    <div className="editor">
      <TopBar/>
      <div className="center">
        <LeftPanel/>
        <CanvasStage/>
        <RightPanel/>
      </div>
      <TimelineDock/>
    </div>
  )
}
