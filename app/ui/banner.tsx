'use client';

import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import { useRouter } from 'next/navigation';

export function Banner() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const solveOwnPuzzle = () => {
    handleClose();
    router.push('/sudoku/import');
  };
  const handleClickLogo = () => {
    router.push('/sudoku');
  };
  return (
    <header className="w-full bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
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
        </div>
      </div>
    </header>
  );
}
