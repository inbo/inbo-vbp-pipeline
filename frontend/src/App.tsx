import "./styles/App.css";
import { withAuthenticationRequired } from "react-oidc-context";
import { PipelineList } from "./components/PipelineList";
import { IndexList } from "./components/IndexList";

function App() {
  return (
    <>
      <h1>VBP Data Pipeline</h1>
      <div id="main">
        <a href="/start-pipeline">
          Start New Pipeline
        </a>
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
