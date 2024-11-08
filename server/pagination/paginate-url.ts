export const paginateUrl = (url: string) => {
    const {searchParams} = new URL(url);
    const page = parseInt(searchParams.get('page') || '1');  // Default to page 1
    const perPage = parseInt(searchParams.get('limit') || '5');
    return {
        page,
        perPage
    };
}