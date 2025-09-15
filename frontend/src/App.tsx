import { useQuery } from "@apollo/client/react";
import "./App.css";
import { GET_INDICES } from "./graphql/indices";
import { withAuthenticationRequired } from "react-oidc-context";

function App() {
  const { data, refetch } = useQuery(GET_INDICES);

  return (
    <>
      <p>Welcome back!</p>
      {data?.indices.map((index: { id: string }) => (
        <div key={index.id}>{index.id}</div>
      ))}
    </>
  );
}

export default withAuthenticationRequired(App);
