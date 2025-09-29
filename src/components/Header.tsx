import { useState } from 'react';
import { Bell, Search, Menu, User, LogOut, X, Mic, MicOff } from 'lucide-react';
import { User as UserType } from '../types/index';
import { voiceService } from '../services/voiceService';

interface HeaderProps {
  user: UserType;
  onLogout: () => void;
  onToggleSidebar: () => void;
  unreadAlerts: number;
}

export default function Header({ user, onLogout, onToggleSidebar, unreadAlerts }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);

  const handleVoiceToggle = async () => {
    if (isVoiceListening) {
      voiceService.stopListening();
      setIsVoiceListening(false);
    } else {
      const started = await voiceService.startListening();
      setIsVoiceListening(started);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg border-b border-white/20 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-2 sm:gap-4 flex-1">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>

          {/* Desktop Search */}
          <div className="relative hidden sm:block">
            <Search className="w-5 h-5 text-white/50 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products, orders, suppliers..."
              className="bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 lg:w-96 transition-all duration-200"
            />
          </div>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors sm:hidden"
          >
            <Search className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Voice Control */}
          <button
            onClick={handleVoiceToggle}
            className={`p-2 rounded-lg transition-colors ${
              isVoiceListening 
                ? 'bg-red-500/20 text-red-400 animate-pulse' 
                : 'hover:bg-white/10 text-white'
            }`}
            title={isVoiceListening ? 'Stop voice listening' : 'Start voice commands'}
          >
            {isVoiceListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <Bell className="w-6 h-6 text-white cursor-pointer hover:text-blue-300 transition-colors" />
            {unreadAlerts > 0 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">
                  {unreadAlerts > 99 ? '99+' : unreadAlerts}
                </span>
              </div>
            )}
          </div>

          {/* User Profile - Desktop */}
          <div className="hidden sm:flex items-center gap-3 bg-white/10 rounded-xl px-3 sm:px-4 py-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-white">
              <div className="font-medium text-sm">{user.username}</div>
              <div className="text-xs text-white/70 capitalize">{user.role}</div>
            </div>
          </div>

          {/* User Profile - Mobile */}
          <div className="sm:hidden flex items-center gap-2 bg-white/10 rounded-xl px-2 py-2">
            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
            <div className="text-white">
              <div className="font-medium text-xs">{user.username}</div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="p-2 hover:bg-red-500/20 rounded-lg transition-colors group"
          >
            <LogOut className="w-5 h-5 text-white group-hover:text-red-300" />
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {isSearchOpen && (
        <div className="sm:hidden mt-4 relative animate-in slide-in-from-top-2 duration-200">
          <Search className="w-5 h-5 text-white/50 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products, orders, suppliers..."
            className="bg-white/10 border border-white/20 rounded-xl pl-10 pr-10 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          />
          <button
            onClick={() => setIsSearchOpen(false)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/10 rounded"
          >
            <X className="w-4 h-4 text-white/50" />
          </button>
        </div>
      )}
    </div>
  );
}
