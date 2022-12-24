const posts = [
    {
        account_id: '63a1a95920fe2a14f0d8c980',
        described: '1a-An essay introduction is the opening paragraph of an essay. It will therefore be the first thing your reader sees when reading your essay. A strong introduction serves two purposes.',
        status: 'Vui' // trường string rỗng nó sẽ không thấy trong mongodb, còn mảng rỗng vẫn thấy, mảng null vẫn thấy
    },{
        account_id: '63a1a95920fe2a14f0d8c980',
        described: '1b-An essay introduction is the opening paragraph of an essay. It will therefore be the first thing your reader sees when reading your essay. A strong introduction serves two purposes.'
    },{
        account_id: '63a1dc3c4e9b3304744f8474',
        described: '2-An essay introduction is the opening paragraph of an essay. It will therefore be the first thing your reader sees when reading your essay. A strong introduction serves two purposes.'
    },
]
const comments = [
    {
        post_id: '63a5907ee8d3c71414358efd',
        userComment_id: '63a1a95920fe2a14f0d8c980',
        content: '1-Comments'
    },{
        post_id: '63a5907ee8d3c71414358efd',
        userComment_id: '63a1dc3c4e9b3304744f8474',
        content: '2a-No comments'
    },{
        post_id: '63a5907ee8d3c71414358efd',
        userComment_id: '63a1dc3c4e9b3304744f8474',
        content: '2b-No comments'
    },{
        post_id: '63a5907ee8d3c71414358efe',
        userComment_id: '63a1dc3c4e9b3304744f8474',
        content: '3-No comments'
    },{
        _id: '5cabe64dcf0d4447fa60f5e2',
        post_id: '63a5907ee8d3c71414358efe',
        userComment_id: '63a1dc3c4e9b3304744f8474',
        content: 'Have _id'
    },
]
module.exports = {posts,comments};