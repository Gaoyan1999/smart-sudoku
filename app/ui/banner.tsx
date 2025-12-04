'use client';

import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import Avatar from '@mui/material/Avatar';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@mui/material';
import { useState, MouseEvent } from 'react';
import { useSudoku } from '../context/sudoku-provider';
import { useAuth } from '../context/auth-provider';

export function Banner() {
  const { sudoku, getNewSudoku } = useSudoku();
  const { user, supabase } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isMainPage = pathname === '/sudoku';
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [avatarAnchorEl, setAvatarAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const avatarMenuOpen = Boolean(avatarAnchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleAvatarClick = (event: MouseEvent<HTMLElement>) => {
    setAvatarAnchorEl(event.currentTarget);
  };
  const handleAvatarMenuClose = () => {
    setAvatarAnchorEl(null);
  };
  const solveOwnPuzzle = () => {
    handleClose();
    router.push('/sudoku/import');
  };
  const handleClickLogo = () => {
    router.push('/sudoku');
  };
  const loginAction = () => {
    router.push('/sudoku/login');
  };
  const logoutAction = async () => {
    handleClose();
    handleAvatarMenuClose();
    await supabase.auth.signOut();
    // refresh the page to update the user state
    window.location.reload();
  };

  // Get user initials for avatar
  const getInitials = (email?: string) => {
    if (!email) return 'U';
    const parts = email.split('@')[0].split('.');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email[0].toUpperCase();
  };
  function startNewGame() {
    getNewSudoku(sudoku.data.difficulty);
  }
  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-4 flex items-center justify-between h-16">
        {/* Left side: Menu, Logo, Game Modes */}
        <div className="flex items-center space-x-6">
          {/* Hamburger Menu */}
          <IconButton
            onClick={handleClick}
            sx={{
              color: 'text.primary',
            }}
          >
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem onClick={solveOwnPuzzle}>Solve Own Puzzle</MenuItem>
            {user ? null : <MenuItem onClick={loginAction}>Login</MenuItem>}
          </Menu>
          {/* Logo */}
          <div className="flex items-center">
            <h1
              className="text-2xl font-bold text-gray-900 cursor-pointer"
              onClick={handleClickLogo}
            >
              Smart Sudoku
            </h1>
          </div>
        </div>
        {/* Right side: New Game button and User Avatar */}
        <div className="flex items-center space-x-4">
          {isMainPage && (
            <Button variant="contained" color="primary" onClick={startNewGame}>
              New Game
            </Button>
          )}
          {user && (
            <>
              <IconButton
                onClick={handleAvatarClick}
                size="small"
                sx={{ ml: 2 }}
                aria-controls={avatarMenuOpen ? 'account-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={avatarMenuOpen ? 'true' : undefined}
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                  {getInitials(user.email)}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={avatarAnchorEl}
                id="account-menu"
                open={avatarMenuOpen}
                onClose={handleAvatarMenuClose}
                onClick={handleAvatarMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem disabled>{user.email}</MenuItem>
                <MenuItem onClick={logoutAction}>Logout</MenuItem>
              </Menu>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
