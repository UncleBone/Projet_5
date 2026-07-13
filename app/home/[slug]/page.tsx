import FullPostComponent from "@/components/fullPost";

export default async function FullPost({ params }: { params: { slug: string } }) {
    const { slug } = await params;

    return <FullPostComponent post_id={Number(slug)} />
}
