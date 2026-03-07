import { PostFormClient } from "./PostFormClient";
import { createProjectIdea } from "./actions";

export default function PostForm() {
  return <PostFormClient action={createProjectIdea} />;
}
