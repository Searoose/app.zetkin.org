import { makeStyles } from '@material-ui/styles';
import React from 'react';
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  FormatStrikethrough,
} from '@material-ui/icons';

import {
  AddAttachmentButton,
  AddLinkButton,
  BlockButton,
  MarkButton,
  RemoveLinkButton,
} from './ToolbarButtons';

const useStyles = makeStyles({
  container: {
    '& button': {
      padding: 6,
    },
    marginTop: 12,
  },
});

const Toolbar: React.FunctionComponent = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <MarkButton format="bold" MarkIcon={FormatBold} />
      <MarkButton format="italic" MarkIcon={FormatItalic} />
      <MarkButton format="strikethrough" MarkIcon={FormatStrikethrough} />
      <RemoveLinkButton />
      <AddLinkButton />
      <BlockButton BlockIcon={FormatQuote} format="block-quote" />
      <BlockButton BlockIcon={FormatListBulleted} format="bulleted-list" />
      <BlockButton BlockIcon={FormatListNumbered} format="numbered-list" />
      <AddAttachmentButton />
    </div>
  );
};

export default Toolbar;
