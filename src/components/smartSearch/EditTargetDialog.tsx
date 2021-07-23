import { FormattedMessage as Msg } from 'react-intl';
import { useState } from 'react';
import { Box, Button, ButtonBase, Card, CardContent, Dialog, DialogContent, Typography } from '@material-ui/core';

import All from './filters/All';
import Filter from './Filter';
import { isFilterWithId } from './utils';
import MostActive from './filters/MostActive';
import patchTaskTarget from 'fetching/tasks/patchTaskTarget';
import { useRouter } from 'next/router';
import { FILTER_TYPE, SelectedSmartSearchFilter, SmartSearchFilterWithId, ZetkinSmartSearchFilter } from 'types/smartSearch';
import { useMutation, useQueryClient } from 'react-query';

import useSmartSearch from 'hooks/useSmartSearch';

interface EditTargetDialogProps {
    filterSpec: ZetkinSmartSearchFilter[];
    onDialogClose: () => void;
    open: boolean;
}

const EditTargetDialog = ({ onDialogClose, open, filterSpec }: EditTargetDialogProps) : JSX.Element => {
    const queryClient = useQueryClient();
    const { orgId, taskId } = useRouter().query;

    const [filterArray, addFilter, editFilter, deleteFilter ] = useSmartSearch(filterSpec);
    const [selectedFilter, setSelectedFilter] = useState<SelectedSmartSearchFilter>(null);

    const taskMutation = useMutation(patchTaskTarget(orgId as string, taskId as string),{
        onSettled: () => queryClient.invalidateQueries(['filter_spec', orgId, taskId]),
    } );

    const handleDialogClose = () => {
        setSelectedFilter(null);
        onDialogClose();
    };

    const handleCancelFilter = () => setSelectedFilter(null);

    const handleSubmitFilter = (filter: SmartSearchFilterWithId | ZetkinSmartSearchFilter) => {
        // If editing a filter
        if (isFilterWithId(filter)) {
            editFilter((filter as SmartSearchFilterWithId).id, filter as SmartSearchFilterWithId);
        }
        // If creating a new filter
        else {
            addFilter(filter);
        }
        setSelectedFilter(null);
    };

    const handleSave = () => {
        taskMutation.mutate(filterArray.map(filter => ({
            config: filter.config, op: filter.op, type: filter.type,
        })));
        onDialogClose();
    };

    const handleDeleteButtonClick = (filter: SmartSearchFilterWithId) => {
        deleteFilter(filter.id);
    };

    const handleEditButtonClick = (filter: SmartSearchFilterWithId) => {
        setSelectedFilter(filter);
    };

    return (
        <Dialog fullWidth maxWidth="xl" onClose={ handleDialogClose } open={ open }>
            <DialogContent>
                { !selectedFilter && (
                    <>
                        <Box p={ 1 }>
                            <Typography variant="h6">
                                <Msg id="misc.smartSearch.headers.current"/>
                            </Typography>
                            { filterArray.map(filter => {
                                return (
                                    <Filter key={ filter.id } filter={ filter } onDelete={ handleDeleteButtonClick } onEdit={ handleEditButtonClick } />
                                );
                            }) }
                        </Box>
                        <Box p={ 1 }>
                            <Typography variant="h6">
                                <Msg id="misc.smartSearch.headers.add"/>
                            </Typography>
                            { /* Buttons to add new filter */ }
                            { Object.values(FILTER_TYPE).map(value => (
                                <ButtonBase
                                    key={ value }
                                    disableRipple
                                    onClick={ () => setSelectedFilter({ type: value }) }>
                                    <Card style={{ margin: '1rem', width: '250px' }}>
                                        <CardContent>
                                            <Typography>
                                                <Msg id={ `misc.smartSearch.filterTitles.${value}` }/>
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </ButtonBase>
                            )) }
                            <Box display="flex" justifyContent="flex-end" m={ 1 } style={{ gap: '1rem' }}>
                                <Button color="primary" onClick={ handleDialogClose }>
                                    <Msg id="misc.smartSearch.buttonLabels.cancel"/>
                                </Button>
                                <Button color="primary" onClick={ handleSave } variant="contained">
                                    <Msg id="misc.smartSearch.buttonLabels.save"/>
                                </Button>
                            </Box>
                        </Box>
                    </>
                ) }
                { selectedFilter?.type === FILTER_TYPE.ALL && <All onCancel={ handleCancelFilter } onSubmit={ handleSubmitFilter }/> }
                { selectedFilter?.type === FILTER_TYPE.MOST_ACTIVE && <MostActive filter={ selectedFilter } onCancel={ handleCancelFilter } onSubmit={ handleSubmitFilter }/> }
            </DialogContent>
        </Dialog>
    );
};

export default EditTargetDialog;
