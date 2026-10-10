import { Link } from "react-router-dom";
import { PageState } from "../components/forme/UI";
export const NotFoundPage = () => (
  <PageState
    title="A little off the beaten path."
    description="This page isn't here. There are plenty of good things back in the collection."
  >
    <Link to="/products" className="store-button">
      Back to the collection
    </Link>
  </PageState>
);
