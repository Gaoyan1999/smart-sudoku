'use client';

import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MenuIcon from '@mui/icons-material/Menu';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@mui/material';
import { useState, MouseEvent } from 'react';
import { useSudoku } from '../context/sudoku-provider';

export function Banner() {
  const { sudoku, getNewSudoku } = useSudoku();
  const router = useRouter();
  const pathname = usePathname();
  const isMainPage = pathname === '/sudoku';
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
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
        {isMainPage && (
          <Button variant="contained" color="primary" onClick={startNewGame}>
            New Game
          </Button>
        )}
      </div>
    </header>
  );
}
