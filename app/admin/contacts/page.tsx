'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  MessageSquare, 
  Calendar, 
  User, 
  Phone, 
  ExternalLink,
  Trash2,
  Archive,
  Star,
  Reply,
  Eye,
  EyeOff,
  Search,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/ConfirmDialog';

interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  replied: boolean;
  replyMessage?: string;
  replyDate?: string;
}

type FilterType = 'all' | 'unread' | 'starred' | 'archived';

export default function ContactMessagesManagement() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  // Confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [messages, searchTerm, activeFilter]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/portfolio/contacts');
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.data || []);
      } else {
        toast.error('Failed to load messages');
      }
    } catch (error) {
      toast.error('Error loading messages');
    } finally {
      setIsLoading(false);
    }
  };

  const filterMessages = () => {
    let filtered = messages;

    // Apply text search
    if (searchTerm) {
      filtered = filtered.filter(message =>
        message.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.message.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    switch (activeFilter) {
      case 'unread':
        filtered = filtered.filter(message => !message.isRead);
        break;
      case 'starred':
        filtered = filtered.filter(message => message.isStarred);
        break;
      case 'archived':
        filtered = filtered.filter(message => message.isArchived);
        break;
      case 'all':
      default:
        filtered = filtered.filter(message => !message.isArchived);
        break;
    }

    setFilteredMessages(filtered);
  };

  const updateMessageStatus = async (messageId: string, updates: Partial<ContactMessage>) => {
    try {
      const response = await fetch(`/api/portfolio/contacts/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => prev.map(msg => 
          msg.id === messageId ? { ...msg, ...updates } : msg
        ));
        
        if (selectedMessage?.id === messageId) {
          setSelectedMessage(prev => prev ? { ...prev, ...updates } : null);
        }
      } else {
        toast.error(data.error || 'Failed to update message');
      }
    } catch (error) {
      toast.error('Error updating message');
    }
  };

  const deleteMessage = async (messageId: string) => {
    setMessageToDelete(messageId);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    if (!messageToDelete) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/portfolio/contacts/${messageToDelete}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Message deleted successfully');
        setMessages(prev => prev.filter(msg => msg.id !== messageToDelete));
        if (selectedMessage?.id === messageToDelete) {
          closeDetailModal();
        }
      } else {
        toast.error(data.error || 'Failed to delete message');
      }
    } catch (error) {
      toast.error('Error deleting message');
    } finally {
      setIsDeleting(false);
      setShowConfirmDialog(false);
      setMessageToDelete(null);
    }
  };

  const closeConfirmDialog = () => {
    setShowConfirmDialog(false);
    setMessageToDelete(null);
    setIsDeleting(false);
  };

  const markAsRead = (messageId: string) => {
    updateMessageStatus(messageId, { isRead: true });
  };

  const toggleStar = (messageId: string, isStarred: boolean) => {
    updateMessageStatus(messageId, { isStarred: !isStarred });
  };

  const toggleArchive = (messageId: string, isArchived: boolean) => {
    updateMessageStatus(messageId, { isArchived: !isArchived });
  };

  const openDetailModal = (message: ContactMessage) => {
    setSelectedMessage(message);
    setIsDetailModalOpen(true);
    
    // Mark as read if not already read
    if (!message.isRead) {
      markAsRead(message.id!);
    }
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedMessage(null);
  };

  const openReplyModal = () => {
    setIsReplyModalOpen(true);
    setReplyText('');
  };

  const closeReplyModal = () => {
    setIsReplyModalOpen(false);
    setReplyText('');
  };

  const sendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    try {
      const replyData = {
        replied: true,
        replyMessage: replyText.trim(),
        replyDate: new Date().toISOString()
      };

      await updateMessageStatus(selectedMessage.id!, replyData);
      toast.success('Reply sent successfully');
      closeReplyModal();
    } catch (error) {
      toast.error('Error sending reply');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFilterCounts = () => {
    return {
      all: messages.filter(m => !m.isArchived).length,
      unread: messages.filter(m => !m.isRead && !m.isArchived).length,
      starred: messages.filter(m => m.isStarred && !m.isArchived).length,
      archived: messages.filter(m => m.isArchived).length
    };
  };

  const filterCounts = getFilterCounts();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Contact Messages</h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage and respond to contact form submissions</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-1 sm:gap-2 overflow-x-auto">
            {[
              { key: 'all', label: 'All', count: filterCounts.all },
              { key: 'unread', label: 'Unread', count: filterCounts.unread },
              { key: 'starred', label: 'Starred', count: filterCounts.starred },
              { key: 'archived', label: 'Archived', count: filterCounts.archived },
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key as FilterType)}
                className={`px-2 py-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  activeFilter === filter.key
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter.label}
                {filter.count > 0 && (
                  <span className={`ml-1 px-1 py-0.5 sm:px-1.5 rounded text-xs ${
                    activeFilter === filter.key
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {filter.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages List */}
      {filteredMessages.length > 0 ? (
        <div className="space-y-4">
          {filteredMessages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-xl shadow-lg border cursor-pointer transition-all hover:shadow-xl ${
                message.isRead ? 'border-gray-100' : 'border-primary-200 bg-primary-50'
              }`}
              onClick={() => openDetailModal(message)}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="text-gray-500" size={16} />
                      <span className="font-semibold text-gray-900">{message.name}</span>
                      {!message.isRead && (
                        <span className="w-2 h-2 bg-primary-600 rounded-full"></span>
                      )}
                      {message.isStarred && (
                        <Star className="text-yellow-500 fill-current" size={16} />
                      )}
                      {message.replied && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                          Replied
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <Mail size={14} />
                        <span>{message.email}</span>
                      </div>
                      
                      {message.phone && (
                        <div className="flex items-center gap-1">
                          <Phone size={14} />
                          <span>{message.phone}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{formatDate(message.createdAt)}</span>
                      </div>
                    </div>

                    <h3 className="font-medium text-gray-900 mb-2">{message.subject}</h3>
                    <p className="text-gray-600 line-clamp-2">{message.message}</p>
                  </div>
                  
                  <div className="flex gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => toggleStar(message.id!, message.isStarred)}
                      className={`p-2 rounded-lg transition-colors ${
                        message.isStarred
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : 'text-gray-400 hover:text-yellow-500'
                      }`}
                    >
                      <Star size={16} className={message.isStarred ? 'fill-current' : ''} />
                    </button>
                    
                    <button
                      onClick={() => toggleArchive(message.id!, message.isArchived)}
                      className="text-gray-400 hover:text-gray-600 p-2 rounded-lg transition-colors"
                    >
                      <Archive size={16} />
                    </button>
                    
                    <button
                      onClick={() => deleteMessage(message.id!)}
                      className="text-red-400 hover:text-red-600 p-2 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📨</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {activeFilter === 'all' ? 'No messages yet' : 
             activeFilter === 'unread' ? 'No unread messages' :
             activeFilter === 'starred' ? 'No starred messages' :
             'No archived messages'}
          </h3>
          <p className="text-gray-600">
            {activeFilter === 'all' ? 'Contact messages will appear here when visitors submit the contact form.' :
             'Try adjusting your filter to see more messages.'}
          </p>
        </div>
      )}

      {/* Message Detail Modal */}
      {isDetailModalOpen && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{selectedMessage.name}</h3>
                    {selectedMessage.isStarred && (
                      <Star className="text-yellow-500 fill-current" size={20} />
                    )}
                    {selectedMessage.replied && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded">
                        Replied
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center gap-1 mb-1">
                      <Mail size={14} />
                      <a href={`mailto:${selectedMessage.email}`} className="text-primary-600 hover:text-primary-800">
                        {selectedMessage.email}
                      </a>
                    </div>
                    {selectedMessage.phone && (
                      <div className="flex items-center gap-1 mb-1">
                        <Phone size={14} />
                        <a href={`tel:${selectedMessage.phone}`} className="text-primary-600 hover:text-primary-800">
                          {selectedMessage.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{formatDate(selectedMessage.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={closeDetailModal}
                  className="text-gray-500 hover:text-gray-700 p-2"
                >
                  ✕
                </button>
              </div>

              {/* Message Content */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Subject</h4>
                  <p className="text-gray-700">{selectedMessage.subject}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Message</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                {/* Reply Section */}
                {selectedMessage.replied && selectedMessage.replyMessage && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Your Reply</h4>
                    <div className="bg-primary-50 border-l-4 border-primary-600 rounded-lg p-4">
                      <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.replyMessage}</p>
                      {selectedMessage.replyDate && (
                        <p className="text-sm text-gray-500 mt-2">
                          Sent on {formatDate(selectedMessage.replyDate)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center mt-6 pt-6 border-t">
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleStar(selectedMessage.id!, selectedMessage.isStarred)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      selectedMessage.isStarred
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Star size={16} className={selectedMessage.isStarred ? 'fill-current' : ''} />
                    {selectedMessage.isStarred ? 'Unstar' : 'Star'}
                  </button>
                  
                  <button
                    onClick={() => toggleArchive(selectedMessage.id!, selectedMessage.isArchived)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Archive size={16} />
                    {selectedMessage.isArchived ? 'Unarchive' : 'Archive'}
                  </button>
                </div>

                <div className="flex gap-2">
                  <a
                    href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Reply size={16} />
                    Reply via Email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={closeConfirmDialog}
        onConfirm={confirmDelete}
        title="Delete Message"
        message="Are you sure you want to delete this contact message? This action cannot be undone and will permanently remove the message from your records."
        confirmText="Delete Message"
        cancelText="Cancel"
        type="danger"
        loading={isDeleting}
      />
    </div>
  );
}
