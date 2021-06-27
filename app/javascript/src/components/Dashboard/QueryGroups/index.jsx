import React, { useState, useEffect } from "react";
import { Button, PageLoader } from "neetoui";
import EmptyState from "components/Common/EmptyState";
import EmptyNotesListImage from "images/EmptyNotesList";
import { Header, SubHeader } from "neetoui/layouts";

import queryGroupService from "apis/queryGroupService";

import ListPage from "./ListPage";
import NewPane from "./NewPane";
// import DeleteAlert from "./DeleteAlert";

const QueryGroups = () => {
  const [loading, setLoading] = useState(true);
  const [showPane, setshowPane] = useState(false);
  const [currentResource, setCurrrentResource] = useState(false);

  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [queryGroups, setQueryGroups] = useState([]);
  

  useEffect(() => {
    fetchQueryGroups();
  }, []);

  const fetchQueryGroups = async () => {
    try {
      setLoading(true);
      const response = await queryGroupService.fetchAll();
      setQueryGroups(response.data);
    } catch (error) {
      logger.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }
  return (
    <>
      <Header
        title="Query Groups"
        actionBlock={
          <Button
            onClick={() => { setCurrrentResource(false); setshowPane(true); } }
            label="New Query Group"
            icon="ri-add-line"
          />
        }
      />
      {queryGroups.length ? (
        <>
          <SubHeader
            searchProps={{
              value: searchTerm,
              onChange: e => setSearchTerm(e.target.value),
              clear: () => setSearchTerm(""),
            }}
          />
          <ListPage
            items={queryGroups}
            setCurrrentResource={setCurrrentResource}
            showPane={setshowPane}
          />
        </>
      ) : (
        <EmptyState
          image={EmptyNotesListImage}
          title="Looks like you don't have any Query Groups!"
          subtitle="Query groups represent a group of queries with same request settings. Add your query groups and add search queries in them."
          primaryAction={() => setshowPane(true)}
          primaryActionLabel="Add New Query Group"
        />
      )}
      <NewPane
        showPane={showPane}
        setShowPane={setshowPane}
        fetchResources={fetchQueryGroups}
        currentResource={currentResource}
        setCurrrentResource={setCurrrentResource}
      />
      {/* showDeleteAlert && (
        <DeleteAlert
          selectedNoteIds={selectedNoteIds}
          onClose={() => setShowDeleteAlert(false)}
          refetch={fetchApiSources}
        />
      ) */}
    </>
  );
};

export default QueryGroups;
