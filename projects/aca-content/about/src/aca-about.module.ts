/*!
 * Copyright © 2005-2023 Hyland Software, Inc. and its affiliates. All rights reserved.
 *
 * Alfresco Example Content Application
 *
 * This file is part of the Alfresco Example Content Application.
 * If the software was purchased under a paid Alfresco license, the terms of
 * the paid license agreement will prevail. Otherwise, the software is
 * provided under the following open source license terms:
 *
 * The Alfresco Example Content Application is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The Alfresco Example Content Application is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * from Hyland Software. If not, see <http://www.gnu.org/licenses/>.
 */

import { ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { AboutComponent } from './about.component';
import { CommonModule } from '@angular/common';
import { SharedModule, PageLayoutModule } from '@alfresco/aca-shared';

import { ExtensionService, provideExtensionConfig } from '@alfresco/adf-extensions';
import { DEV_MODE_TOKEN } from './dev-mode.tokens';
import { PACKAGE_JSON } from './package-json.token';
import { AboutModule } from '@alfresco/adf-core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, RouterModule, TranslateModule, SharedModule, PageLayoutModule, AboutModule],
  declarations: [AboutComponent],
  providers: [provideExtensionConfig(['about.plugin.json'])]
})
export class AcaAboutModule {
  constructor(extensions: ExtensionService) {
    extensions.setComponents({
      'app.about.component': AboutComponent
    });
  }

  public static forRoot(devMode: any, packageJson?: any): ModuleWithProviders<AcaAboutModule> {
    const providers: Provider[] = [{ provide: DEV_MODE_TOKEN, useValue: devMode }];

    if (packageJson) {
      providers.push({
        provide: PACKAGE_JSON,
        useValue: packageJson
      });
    }

    return {
      ngModule: AcaAboutModule,
      providers
    };
  }
}