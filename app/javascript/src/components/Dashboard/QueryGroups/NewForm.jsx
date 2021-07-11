import React, { useState, useEffect } from "react";
import * as yup from "yup";
import { Formik, Form } from "formik";
import { Input, Textarea, Select } from "neetoui/formik";
import { Button } from "neetoui";

import { serializeObject, deserializeObject } from "common/jsonHelper";
import queryGroupService from "apis/queryGroupService";
import scorerService from "apis/scorerService";
import apiSourceService from "apis/apiSourceService";

const getList = async (service) => {
  const response = await service.fetchAll();
  return response.data.map((resource) => ({ value: resource.id, label: resource.name }));
}

const RequestTypeInputField = ({ showQueryStringField }) => {
  if(showQueryStringField) {
    return (<Input label="Query String" name="query_string" rows={8} className="mb-6" />);
  } else {
    return (<Textarea label="Request Body" name="request_body" rows={8} className="mb-6" />);
  }
}

const preProcessObject = (resource) => {
  resource.request_body = deserializeObject(resource.request_body);
  resource.transform_response = deserializeObject(resource.transform_response);

  if(typeof resource.api_source_id === 'object' && resource.api_source_id !== null) {
    resource.api_source_id = resource.api_source_id.value;
  }
  if(typeof resource.scorer_id === 'object' && resource.scorer_id !== null) {
    resource.scorer_id = resource.scorer_id.value;
  }
  return resource;
}

const defaultValues = (currentResource) => {
  let resourceObj = currentResource || {
    name: "",
    api_source_id: 0,
    scorer_id: 0,
    http_method: "GET",
    page_size: 10,
    request_body: {},
    query_string: "",
    transform_response: {},
    document_uuid: '',
    document_fields: []
  };

  resourceObj.request_body = serializeObject(resourceObj.request_body);
  resourceObj.transform_response = serializeObject(resourceObj.transform_response);

  return resourceObj;
}


export default function NewForm({ onClose, refetch, currentResource }) {
  const [loading, setLoading] = useState(true);
  const [resourceObject, setResourceObject] = useState(defaultValues(currentResource));
  const [showQueryStringField, setShowQueryStringField] = useState(resourceObject.http_method === 'GET');
  const [scorerOptions, setScorerOptions] = useState([]);
  const [sourcesOptions, setSourcesOptions] = useState([]);

  useEffect(() => {
    fetchQueryGroups();
  }, []);

  const fetchQueryGroups = async () => {
    try {
      setLoading(true);
      const sourcesList = await getList(apiSourceService);
      const scorerList = await getList(scorerService);
      setSourcesOptions(sourcesList);
      setScorerOptions(scorerList);
    } catch (error) {
      logger.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async values => {
    try {
      const processedValues = preProcessObject(values);
      if(currentResource) {
        await queryGroupService.update(currentResource.id, processedValues);
      } else {
        await queryGroupService.create(processedValues);
      }
      refetch();
      onClose();
    } catch (err) {
      logger.error(err);
    }
  };

  return (
    <Formik
      initialValues={resourceObject}
      onSubmit={handleSubmit}
      validationSchema={yup.object({
        name: yup.string().required("Name is required"),
        http_method: yup.string().required("HTTP Method is required"),
        page_size: yup.number().required("Page Size is required"),
        document_uuid: yup.string().required("Document UUID is required"),
        document_fields: yup.array().required("Document fields are required"),
      })}
    >
      {({ isSubmitting }) => (
        <Form>
          <Input label="Name" name="name" className="mb-6" />
          <Select
            label="Source"
            placeholder="Select an Option"
            isDisabled={false}
            isClearable={true}
            isSearchable={true}
            name="api_source_id"
            options={sourcesOptions}
            className="mb-6"
          />
          <Select
            label="Scorer"
            placeholder="Select an Option"
            isDisabled={false}
            isClearable={true}
            isSearchable={true}
            name="scorer_id"
            options={scorerOptions}
            className="mb-6"
          />
          <Input label="Page Size" name="page_size" type="Number" className="mb-6" />
          <Select
            label="Request Type"
            placeholder="Select an Option"
            name="http_method"
            onChange={(opt) => {
              setShowQueryStringField(opt.value === 'GET');
            } }
            options={[
              { value: "GET", label: "GET" },
              { value: "POST", label: "POST" },
            ]}
            className="mb-6"
          />

          <RequestTypeInputField showQueryStringField={showQueryStringField} />
          <Input label="Document UUID" name="document_uuid" type="String" className="mb-6" />
          <Textarea label="Transform Response" name="transform_response" rows={8} className="mb-6" />
          <div className="nui-pane__footer nui-pane__footer--absolute">
            <Button
              onClick={onClose}
              label="Cancel"
              size="large"
              style="secondary"
            />

            <Button
              type="submit"
              label="Submit"
              size="large"
              style="primary"
              className="ml-2"
              disabled={isSubmitting}
              loading={isSubmitting}
            />
          </div>
        </Form>
      )}
    </Formik>
  );
}
