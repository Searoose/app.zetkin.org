/* eslint-disable react/display-name */
import { Avatar } from '@mui/material';
import { forwardRef } from 'react';

interface ZUIAvatarProps {
  orgId: number;
  personId: number;
  size?: 'sm' | 'md' | 'lg';
}
const SIZES = {
  lg: 50,
  md: 40,
  sm: 30,
};

const ZUIAvatar = forwardRef<HTMLDivElement, ZUIAvatarProps>(
  ({ orgId, personId, size = 'md', ...restProps }, ref) => {
    return (
      <Avatar
        ref={ref}
        {...restProps}
        src={`/api/orgs/${orgId}/people/${personId}/avatar`}
        style={{ height: SIZES[size], width: SIZES[size] }}
      />
    );
  }
);

export default ZUIAvatar;
