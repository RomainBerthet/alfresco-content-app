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

import { ContentActionRef, SidebarTabRef } from '@alfresco/adf-extensions';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { SetInfoDrawerStateAction, ToggleInfoDrawerAction } from '@alfresco/aca-shared/store';
import { of, Subject } from 'rxjs';
import { InfoDrawerComponent } from './info-drawer.component';
import { LibTestingModule } from '../../testing/lib-testing-module';
import { AppExtensionService } from '../../services/app.extension.service';
import { ContentApiService } from '../../services/content-api.service';

describe('InfoDrawerComponent', () => {
  let fixture: ComponentFixture<InfoDrawerComponent>;
  let component: InfoDrawerComponent;
  let contentApiService: ContentApiService;
  let tab: SidebarTabRef;
  let appExtensionService: AppExtensionService;
  const mockStream = new Subject();
  const storeMock = {
    dispatch: jasmine.createSpy('dispatch'),
    select: () => mockStream
  };
  const extensionServiceMock = {
    getSidebarTabs: () => {},
    getAllowedSidebarActions: () =>
      of([
        {
          id: 'app.sidebar.close',
          order: 100,
          title: 'close',
          icon: 'highlight_off'
        }
      ])
  };

  const mockNode = {
    isFile: false,
    createdByUser: { id: 'admin', displayName: 'Administrator' },
    modifiedAt: new Date('2017-05-24T15:08:55.640Z'),
    nodeType: 'cm:content',
    content: {
      mimeType: 'application/rtf',
      mimeTypeName: 'Rich Text Format',
      sizeInBytes: 14530,
      encoding: 'UTF-8'
    },
    parentId: 'd124de26-6ba0-4f40-8d98-4907da2d337a',
    createdAt: new Date('2017-05-24T15:08:55.640Z'),
    path: {
      name: '/Company Home/Guest Home',
      isComplete: true,
      elements: [
        {
          id: '94acfc73-7014-4475-9bd9-93a2162f0f8c',
          name: 'Company Home'
        },
        { id: 'd124de26-6ba0-4f40-8d98-4907da2d337a', name: 'Guest Home' }
      ]
    },
    isFolder: true,
    modifiedByUser: { id: 'admin', displayName: 'Administrator' },
    name: 'b_txt_file.rtf',
    id: '70e1cc6a-6918-468a-b84a-1048093b06fd',
    properties: { 'cm:versionLabel': '1.0', 'cm:versionType': 'MAJOR' },
    allowableOperations: ['delete', 'update']
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LibTestingModule, InfoDrawerComponent],
      providers: [
        { provide: AppExtensionService, useValue: extensionServiceMock },
        { provide: Store, useValue: storeMock }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(InfoDrawerComponent);
    component = fixture.componentInstance;
    appExtensionService = TestBed.inject(AppExtensionService);
    contentApiService = TestBed.inject(ContentApiService);

    tab = { title: 'tab1', id: 'tab1', component: '' };
    spyOn(appExtensionService, 'getSidebarTabs').and.returnValue([tab]);
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should get tabs configuration on initialization', () => {
    fixture.detectChanges();

    expect(component.tabs).toEqual([tab]);
  });

  it('should set state to false OnDestroy event', () => {
    fixture.detectChanges();
    component.ngOnDestroy();

    expect(storeMock.dispatch).toHaveBeenCalledWith(new SetInfoDrawerStateAction(false));
  });

  it('should set displayNode when node is library', () => {
    spyOn(contentApiService, 'getNodeInfo');
    const nodeMock: any = {
      entry: { id: 'nodeId' },
      isLibrary: true
    };
    component.node = nodeMock;

    fixture.detectChanges();
    component.ngOnChanges();

    expect(component.displayNode).toBe(nodeMock);
    expect(contentApiService.getNodeInfo).not.toHaveBeenCalled();
  });

  it('should call getNodeInfo() when node is a shared file', () => {
    const response: any = { entry: { id: 'nodeId' } };
    spyOn(contentApiService, 'getNodeInfo').and.returnValue(of(response));
    const nodeMock: any = { entry: { nodeId: 'nodeId' }, isLibrary: false };
    component.node = nodeMock;

    fixture.detectChanges();
    component.ngOnChanges();

    expect(component.displayNode).toBe(response);
    expect(contentApiService.getNodeInfo).toHaveBeenCalled();
  });

  it('should call getNodeInfo() when node is a favorite file', () => {
    const response: any = { entry: { id: 'nodeId' } };
    spyOn(contentApiService, 'getNodeInfo').and.returnValue(of(response));
    const nodeMock: any = {
      entry: { id: 'nodeId', guid: 'guidId' },
      isLibrary: false
    };
    component.node = nodeMock;

    fixture.detectChanges();
    component.ngOnChanges();

    expect(component.displayNode).toBe(response);
    expect(contentApiService.getNodeInfo).toHaveBeenCalled();
  });

  it('should call getNodeInfo() when node is a recent file', () => {
    const response: any = { entry: { id: 'nodeId' } };
    spyOn(contentApiService, 'getNodeInfo').and.returnValue(of(response));
    const nodeMock: any = {
      entry: {
        id: 'nodeId',
        content: { mimeType: 'image/jpeg' }
      },
      isLibrary: false
    };
    component.node = nodeMock;

    fixture.detectChanges();
    component.ngOnChanges();

    expect(component.displayNode).toBe(response);
    expect(contentApiService.getNodeInfo).toHaveBeenCalled();
  });

  it('should dispatch close panel on Esc keyboard event', () => {
    const event = new KeyboardEvent('keydown', {
      code: 'Escape',
      key: 'Escape',
      keyCode: 27
    } as KeyboardEventInit);

    fixture.detectChanges();

    fixture.debugElement.nativeElement.dispatchEvent(event);

    expect(storeMock.dispatch).toHaveBeenCalledWith(new ToggleInfoDrawerAction());
  });

  it('should show the icons from extension', () => {
    fixture.detectChanges();
    mockStream.next();
    expect(component.actions).toEqual([
      {
        id: 'app.sidebar.close',
        order: 100,
        title: 'close',
        icon: 'highlight_off'
      } as ContentActionRef
    ]);
  });

  it('should return the icon when getNodeIcon is called', () => {
    const expectedIcon = 'assets/images/ft_ic_folder';
    spyOn(contentApiService, 'getNodeIcon').and.returnValue(expectedIcon);
    fixture.detectChanges();
    const result = component.getNodeIcon(mockNode);
    expect(result).toContain(expectedIcon);
  });
});
