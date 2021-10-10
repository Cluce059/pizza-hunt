const { Schema, model, Types } = require('mongoose');
const dateFormat = require('../utils/dateFormat');

const ReplySchema = new Schema(
    {
        //custom id to avoid parent comment_id confusion
        replyId: {
            type: Schema.Types.ObjectId,
            default: () => new Types.ObjectId()
        },
        replyBody: {
            type: String
        },
        writtenBy: { 
            type: String
        },
        createdAt: {
            type: Date,
            default: Date.now,
            get: createdVal => dateFormat(createdVal)
        }
    },
    {
        toJSON: {
            getters: true
        }
    }
);

const CommentSchema = new Schema({
    writtenBy: {
        type: String
    },
    commentBody: {
        type: String
    },
    createdAt: {
        type: Date,
        Default: Date.now,
        get: createdVal => dateFormat(createdVal)
    },
    replies: [ReplySchema]
},
{
    toJSON: {
        virtuals: true,
        getters: true
    },
    id: false
    }    
);

CommentSchema.virtual('replyCount').get(function(){
    return this.replies.length;
});


const Comment = model('Comment', CommentSchema);

module.exports =Comment;
