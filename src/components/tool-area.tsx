import { useContext } from "react";
import { SudokuContext } from "./root.tsx";
import {
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
} from "@mui/material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import * as React from "react";
import { purple } from "@mui/material/colors";

export function ToolArea({
  showAllCandidates,
}: {
  showAllCandidates: () => void;
}) {
  const { mode, switchMode } = useContext(SudokuContext);

  function handleModeChanged(_: React.MouseEvent<HTMLElement>, val: string) {
    if (val) {
      switchMode();
    }
  }

  return (
    <div>
      <div>Noting Mode (Press X to switch) </div>
      <ToggleButtonGroup
        color="primary"
        value={mode}
        exclusive
        size="small"
        onChange={handleModeChanged}
      >
        <ToggleButton value="normal">Normal</ToggleButton>
        <ToggleButton value="noting">Noting</ToggleButton>
      </ToggleButtonGroup>
      <div>Tool Area</div>
      <Tooltip title="Show all candidates(Press C)">
        <IconButton onClick={() => showAllCandidates()}>
          <AutoFixHighIcon sx={{ color: purple[300] }} />
        </IconButton>
      </Tooltip>
    </div>
  );
}
