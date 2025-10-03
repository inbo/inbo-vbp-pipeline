import { RunningPipelines } from "../components/RunningPipelines";
import { IndexList } from "../components/IndexList";
import { PipelineList } from "../components/PipelineList";

export function Home() {
    return (
        <div id="main">
            <RunningPipelines />
            <div id="overview">
                <div id="indices">
                    <h2>
                        Available Indices:
                    </h2>
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
    );
}
