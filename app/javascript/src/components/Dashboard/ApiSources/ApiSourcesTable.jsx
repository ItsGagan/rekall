import React from "react";
import { Checkbox } from "neetoui";

export default function ApiSourcesTable({
  apiSources = [],
}) {
  return (
    <div className="w-full px-4">
      <table className="nui-table nui-table--checkbox">
        <thead>
          <tr>
            <th> ID </th>
            <th className="text-left">Name</th>
            <th className="text-left">Host</th>
          </tr>
        </thead>
        <tbody>
          {apiSources.map(apiSource => (
            <tr
              key={apiSource.id}
              className={"cursor-pointer bg-white hover:bg-gray-50"}
            >
              <td> {apiSource.id} </td>
              <td>
                <div className="flex flex-row items-center justify-start text-gray-900">
                {apiSource.environment}  / {apiSource.name}
                </div>
              </td>
              <td>{apiSource.host}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
