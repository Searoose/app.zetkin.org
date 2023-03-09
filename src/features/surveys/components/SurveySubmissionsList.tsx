import { useQuery } from 'react-query';
import { useRouter } from 'next/router';
import { FC, useMemo } from 'react';

import { Box } from '@mui/system';
import { Link } from '@mui/material';
import {
  DataGridPro,
  GridCellParams,
  GridRenderCellParams,
  useGridApiContext,
} from '@mui/x-data-grid-pro';

import getPeopleSearchResults from 'utils/fetching/getPeopleSearchResults';
import messageIds from '../l10n/messageIds';
import SurveySubmissionModel from '../models/SurveySubmissionModel';
import SurveySubmissionPane from '../panes/SurveySubmissionPane';
import useModel from 'core/useModel';
import { usePanes } from 'utils/panes';
import ZUIPersonGridCell from 'zui/ZUIPersonGridCell';
import ZUIPersonGridEditCell from 'zui/ZUIPersonGridEditCell';
import ZUIRelativeTime from 'zui/ZUIRelativeTime';
import { Msg, useMessages } from 'core/i18n';
import { ZetkinPerson, ZetkinSurveySubmission } from 'utils/types/zetkin';

const SurveySubmissionsList = ({
  submissions,
}: {
  submissions: ZetkinSurveySubmission[];
}) => {
  const messages = useMessages(messageIds);
  const { orgId } = useRouter().query;
  const { openPane } = usePanes();

  const sortedSubmissions = useMemo(() => {
    const sorted = [...submissions].sort((subOne, subTwo) => {
      const dateOne = new Date(subOne.submitted);
      const dateTwo = new Date(subTwo.submitted);
      return dateTwo.getTime() - dateOne.getTime();
    });
    return sorted;
  }, [submissions]);

  const makeSimpleColumn = (
    field: keyof NonNullable<ZetkinSurveySubmission['respondent']>,
    messageId:
      | 'dateColumn'
      | 'emailColumn'
      | 'firstNameColumn'
      | 'lastNameColumn'
      | 'personRecordColumn'
  ) => {
    return {
      field: field,
      flex: 1,
      headerName: messages.submissions[messageId](),
      renderCell: (
        params: GridRenderCellParams<string, ZetkinSurveySubmission>
      ) => {
        if (params.row.respondent !== null) {
          return <Box>{params.row.respondent[field]}</Box>;
        }
        return (
          <Box
            sx={{
              fontStyle: 'italic',
            }}
          >
            <Msg id={messageIds.submissions.anonymous} />
          </Box>
        );
      },
      sortable: true,
    };
  };

  const gridColumns = [
    makeSimpleColumn('first_name', 'firstNameColumn'),
    makeSimpleColumn('last_name', 'lastNameColumn'),
    makeSimpleColumn('email', 'emailColumn'),
    {
      field: `submitted`,
      flex: 1,
      headerName: messages.submissions.dateColumn(),
      renderCell: (
        params: GridRenderCellParams<string, ZetkinSurveySubmission>
      ) => {
        if (params.row.respondent !== null) {
          return <ZUIRelativeTime datetime={params.row.submitted} />;
        }
      },
      sortable: true,
    },
    {
      editable: true,
      field: 'respondent',
      flex: 1,
      headerName: messages.submissions.personRecordColumn(),
      renderCell: (
        params: GridRenderCellParams<
          ZetkinSurveySubmission['respondent'],
          ZetkinSurveySubmission
        >
      ) => {
        return <ReadCell row={params.row} />;
      },
      renderEditCell: (
        params: GridRenderCellParams<
          ZetkinSurveySubmission['respondent'],
          ZetkinSurveySubmission
        >
      ) => {
        return <EditCell row={params.row} />;
      },
      sortable: true,
    },
  ];

  const ReadCell: FC<{ row: ZetkinSurveySubmission }> = ({ row }) => {
    const api = useGridApiContext();

    const startEditing = () => {
      return api.current.startCellEditMode({
        field: 'respondent',
        id: row.id,
      });
    };

    if (row.respondent?.id) {
      return (
        <ZUIPersonGridCell
          onClick={startEditing}
          personId={row.respondent.id}
        />
      );
    } else {
      return (
        <Link onClick={startEditing} sx={{ cursor: 'pointer' }}>
          <Msg id={messageIds.submissions.link} />
        </Link>
      );
    }
  };

  const EditCell: FC<{ row: ZetkinSurveySubmission }> = ({ row }) => {
    const api = useGridApiContext();
    const { orgId } = useRouter().query;
    const email = row.respondent?.email || '';
    let { data: suggestedPeople } = useQuery(
      ['peopleSearchResults', email],
      getPeopleSearchResults(email, orgId as string),
      {
        enabled: email.length >= 2,
        retry: true,
      }
    );

    if (!suggestedPeople) {
      suggestedPeople = [];
    }

    const subsModel = useModel(
      (env) => new SurveySubmissionModel(env, parseInt(orgId as string), row.id)
    );

    const updateCellValue = (person: ZetkinPerson | null) => {
      api.current.stopCellEditMode({
        field: 'respondent',
        id: row.id,
      });
      subsModel.setRespondentId(person?.id || null);
    };

    return (
      <ZUIPersonGridEditCell
        cell={row.respondent}
        onUpdate={updateCellValue}
        removePersonLabel={messages.submissions.unlink()}
        suggestedPeople={suggestedPeople}
        suggestedPeopleLabel={messages.submissions.suggestedPeople()}
      />
    );
  };

  return (
    <Box
      sx={{
        '& .pointer': {
          cursor: 'pointer',
        },
      }}
    >
      <DataGridPro
        autoHeight
        columns={gridColumns}
        disableColumnFilter
        disableColumnMenu
        experimentalFeatures={{ newEditingApi: true }}
        getCellClassName={(params: GridCellParams<string>) => {
          return params.field === 'respondent' ? '' : 'pointer';
        }}
        onCellClick={(params) => {
          if (params.field !== 'respondent') {
            openPane({
              render() {
                return (
                  <SurveySubmissionPane
                    id={params.row.id}
                    orgId={parseInt(orgId as string)}
                  />
                );
              },
              width: 400,
            });
          }
        }}
        rows={sortedSubmissions}
        style={{
          border: 'none',
        }}
      />
    </Box>
  );
};

export default SurveySubmissionsList;