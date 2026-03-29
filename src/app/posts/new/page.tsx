import PostForm from "@/components/post-form/PostForm";

export default function NewPostPage() {
  return (
    <main className="min-h-screen bg-slateLight px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <PostForm />
      </div>
    </main>
  );
}
