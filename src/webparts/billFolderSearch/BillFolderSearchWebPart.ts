import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  BaseClientSideWebPart // Ensure you import this
} from "@microsoft/sp-webpart-base";
import BillFolderSearch, { IBillFolderSearchProps } from "./components/BillFolderSearch";

export default class BillFolderSearchWebPart extends BaseClientSideWebPart<{}> {
  public render(): void {
    const element: React.ReactElement<IBillFolderSearchProps> = React.createElement(
      BillFolderSearch,
      {
        context: this.context, // Ensure context is passed correctly
      }
    );
    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }
}
