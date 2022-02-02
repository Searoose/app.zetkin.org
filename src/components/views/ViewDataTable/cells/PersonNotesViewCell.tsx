import { FunctionComponent } from 'react';
import { GridRenderCellParams } from '@mui/x-data-grid-pro';
import { Typography } from '@material-ui/core';

import { ViewGridCellParams } from '.';

interface PersonNote {
  created: string;
  id: number;
  text: string;
}

export type PersonNotesParams = ViewGridCellParams<PersonNote[] | null>;

interface PersonNotesViewCellProps {
  params: GridRenderCellParams;
}

const PersonNotesViewCell: FunctionComponent<PersonNotesViewCellProps> = ({
  params,
}) => {
  const notes: PersonNote[] | null = params?.row && params.row[params.field];
  if (notes?.length) {
    const sorted = notes.concat().sort((n0, n1) => {
      return n0.created < n1.created ? 1 : -1;
    });

    return (
      <Typography
        style={{
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {sorted[0].text}
      </Typography>
    );
  }

  return null;
};

export default PersonNotesViewCell;
