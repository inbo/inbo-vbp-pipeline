import "./styles/App.css";
import { withAuthenticationRequired } from "react-oidc-context";
import { PipelineList } from "./components/PipelineList";
import { IndexList } from "./components/IndexList";
import { RunningPipelines } from "./components/RunningPipelines";
import { Link } from "react-router";

function App() {
  return (
    <>
      <h1>VBP Data Pipelines</h1>
      <div id="main">
        <RunningPipelines />
        <Link to="/start" className="btn btn-primary">
          Start New Pipeline
        </Link>
        <div id="overview">
          <div id="indices">
            <h2>Available Indices:</h2>
            <div>
              <IndexList />
            </div>
          </div>
          <div id="pipelines">
            <h2>Pipelines:</h2>
            <div>
              <PipelineList />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default withAuthenticationRequired(App);
