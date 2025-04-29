import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { ThemeContext } from '../context/ThemeContext';

const Comments = ({ song }) => {
  const { theme } = useContext(ThemeContext);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      let fetchedComments = [];
      if (song?.platform === 'youtube') {
        // Mock YouTube comments
        fetchedComments = [
          { id: 1, user: 'User1', text: 'Great track!' },
          { id: 2, user: 'User2', text: 'Love this vibe!' },
        ];
      } else if (song?.platform === 'soundcloud') {
        // Mock SoundCloud comments
        fetchedComments = [
          { id: 3, user: 'DJFan', text: 'Awesome beat!' },
        ];
      } else if (song?.platform === 'spotify' || song?.platform === 'yandex') {
        // Mock Spotify/Yandex comments
        fetchedComments = [
          { id: 4, user: 'MusicLover', text: 'Nice song!' },
        ];
      } else if (song?.platform === 'local') {
        // Local comments (in-memory)
        fetchedComments = JSON.parse(localStorage.getItem(`comments_${song.id}`) || '[]');
      }
      setComments(fetchedComments.sort((a, b) => b.id - a.id)); // Latest first
    };
    fetchComments();
  }, [song]);

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const comment = { id: Date.now(), user: 'Anonymous', text: newComment };
    const updatedComments = [comment, ...comments];
    setComments(updatedComments);
    if (song?.platform === 'local') {
      localStorage.setItem(`comments_${song.id}`, JSON.stringify(updatedComments));
    }
    setNewComment('');
  };

  return (
    <motion.div
      className={`w-full md:w-80 h-full p-4 overflow-y-auto ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} shadow-md`}
      initial={{ x: 100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className={`text-lg font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        Comments
      </h3>
      <form onSubmit={handleAddComment} className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className={`w-full p-2 rounded ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-gray-100 text-gray-900 border-gray-300'} border focus:outline-none focus:ring-2 focus:ring-blue-500`}
          rows={3}
        />
        <button
          type="submit"
          className="mt-2 p-2 w-full rounded-md bg-blue-600 hover:bg-blue-700 text-white transition"
        >
          Post
        </button>
      </form>
      <div className="space-y-2">
        {comments.map((comment) => (
          <div key={comment.id} className={`p-2 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
            <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              {comment.user}
            </p>
            <p className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{comment.text}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default Comments;
