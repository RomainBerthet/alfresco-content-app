/*!
 * @license
 * Alfresco Example Content Application
 *
 * Copyright (C) 2005 - 2020 Alfresco Software Limited
 *
 * This file is part of the Alfresco Example Content Application.
 * If the software was purchased under a paid Alfresco license, the terms of
 * the paid license agreement will prevail.  Otherwise, the software is
 * provided under the following open source license terms:
 *
 * The Alfresco Example Content Application is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The Alfresco Example Content Application is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

import { RepoClient, Utils, AdminActions, UserActions, LoginPage, BrowsingPage, SearchResultsPage } from '@alfresco/aca-testing-shared';
import * as testData from './test-data';
import * as testUtil from '../test-util';

describe('Multiple Files - available actions : ', () => {
  const random = Utils.random();
  const username = `user-${random}`;

  const parentName = `parent-${random}`;
  let parentId: string;

  const file1 = `fileActions-1-${random}.txt`;
  let file1Id: string;
  const file2 = `fileActions-2-${random}.txt`;
  let file2Id: string;
  const file1LockedFav = `fileActions-lockedFav1-${random}.txt`;
  let file1LockedFavId: string;
  const file2LockedFav = `fileActions-lockedFav2-${random}.txt`;
  let file2LockedFavId: string;

  const userApi = new RepoClient(username, username);
  const adminApiActions = new AdminActions();
  const userActions = new UserActions();

  const loginPage = new LoginPage();
  const page = new BrowsingPage();
  const { dataTable } = page;
  const { searchInput } = page.header;
  const searchResultsPage = new SearchResultsPage();

  beforeAll(async () => {
    await adminApiActions.login();
    await adminApiActions.createUser({ username });
    await userActions.login(username, username);

    parentId = (await userApi.nodes.createFolder(parentName)).entry.id;

    file1Id = (await userApi.nodes.createFile(file1, parentId)).entry.id;
    file2Id = (await userApi.nodes.createFile(file2, parentId)).entry.id;
    file1LockedFavId = (await userApi.nodes.createFile(file1LockedFav, parentId)).entry.id;
    file2LockedFavId = (await userApi.nodes.createFile(file2LockedFav, parentId)).entry.id;

    await userApi.nodes.lockFile(file1LockedFavId);
    await userApi.nodes.lockFile(file2LockedFavId);

    const initialFavoritesTotalItems = (await userApi.favorites.getFavoritesTotalItems()) || 0;
    await userApi.favorites.addFavoritesByIds('file', [file1LockedFavId, file2LockedFavId]);
    await userApi.favorites.waitForApi({ expect: initialFavoritesTotalItems + 2 });

    const initialSharedTotalItems = await userApi.shared.getSharedLinksTotalItems();
    await userApi.shared.shareFilesByIds([file1Id, file2Id, file1LockedFavId, file2LockedFavId]);
    await userApi.shared.waitForApi({ expect: initialSharedTotalItems + 4 });

    await loginPage.loginWith(username);
  });

  afterAll(async () => {
    await userActions.unlockNodes([file1LockedFavId, file2LockedFavId]);
    await userActions.deleteNodes([parentId]);
  });

  beforeEach(async () => {
    await Utils.pressEscape();
  });

  describe('on Personal Files : ', () => {
    beforeEach(async () => {
      await page.clickPersonalFilesAndWait();
      await dataTable.doubleClickOnRowByName(parentName);
      await dataTable.waitForHeader();
    });

    it('multiple files - [C217112]', async () => {
      await testUtil.checkMultipleSelContextMenu([file1, file2], testData.multipleSel.contextMenu);
      await testUtil.checkMultipleSelToolbarActions([file1, file2], testData.multipleSel.toolbarPrimary, testData.multipleSel.toolbarMore);
    });

    it('multiple files - all favorite, locked - [C297619]', async () => {
      await testUtil.checkMultipleSelContextMenu([file1LockedFav, file2LockedFav], testData.multipleSelAllFav.contextMenu);
      await testUtil.checkMultipleSelToolbarActions(
        [file1LockedFav, file2LockedFav],
        testData.multipleSel.toolbarPrimary,
        testData.multipleSelAllFav.toolbarMore
      );
    });
  });

  describe('on Favorites : ', () => {
    beforeEach(async () => {
      await page.clickPersonalFiles();
      await page.clickFavoritesAndWait();
    });

    it('multiple files - all favorite - [C280656]', async () => {
      await testUtil.checkMultipleSelContextMenu([file1LockedFav, file2LockedFav], testData.multipleSelAllFav.favoritesContextMenu);
      await testUtil.checkMultipleSelToolbarActions(
        [file1LockedFav, file2LockedFav],
        testData.multipleSelAllFav.toolbarPrimary,
        testData.multipleSelAllFav.favoritesToolbarMore
      );
    });
  });

  describe('on Recent Files : ', () => {
    beforeEach(async () => {
      await page.clickPersonalFiles();
      await page.clickRecentFilesAndWait();
    });

    it('multiple files - [C280468]', async () => {
      await testUtil.checkMultipleSelContextMenu([file1, file2], testData.multipleSel.contextMenu);
      await testUtil.checkMultipleSelToolbarActions([file1, file2], testData.multipleSel.toolbarPrimary, testData.multipleSel.toolbarMore);
    });

    it('multiple files - all favorite - [C326689]', async () => {
      await testUtil.checkMultipleSelContextMenu([file1LockedFav, file2LockedFav], testData.multipleSelAllFav.contextMenu);
      await testUtil.checkMultipleSelToolbarActions(
        [file1LockedFav, file2LockedFav],
        testData.multipleSel.toolbarPrimary,
        testData.multipleSelAllFav.toolbarMore
      );
    });
  });

  describe('on Search Results : ', () => {
    beforeEach(async () => {
      await page.clickPersonalFiles();
      await searchInput.clickSearchButton();
      await searchInput.searchFor('fileActions-');
      await searchResultsPage.waitForResults();
    });

    it('[C291820] multiple files', async () => {
      await testUtil.checkMultipleSelContextMenu([file1, file2], testData.multipleSel.searchContextMenu);
      await testUtil.checkMultipleSelToolbarActions(
        [file1, file2],
        testData.multipleSel.searchToolbarPrimary,
        testData.multipleSel.searchToolbarMore
      );
    });

    it('[C326690] multiple files - all favorite, locked', async () => {
      await testUtil.checkMultipleSelContextMenu([file1LockedFav, file2LockedFav], testData.multipleSelAllFav.searchContextMenu);
      await testUtil.checkMultipleSelToolbarActions(
        [file1LockedFav, file2LockedFav],
        testData.multipleSelAllFav.searchToolbarPrimary,
        testData.multipleSelAllFav.searchToolbarMore
      );
    });
  });

  describe('on Shared Files : ', () => {
    beforeEach(async () => {
      await page.clickPersonalFiles();
      await page.clickSharedFilesAndWait();
    });

    it('multiple files - [C280467]', async () => {
      await testUtil.checkMultipleSelContextMenu([file1, file2], testData.multipleSel.contextMenu);
      await testUtil.checkMultipleSelToolbarActions([file1, file2], testData.multipleSel.toolbarPrimary, testData.multipleSel.toolbarMore);
    });

    it('multiple files - all favorite - [C326691]', async () => {
      await testUtil.checkMultipleSelContextMenu([file1LockedFav, file2LockedFav], testData.multipleSelAllFav.contextMenu);
      await testUtil.checkMultipleSelToolbarActions(
        [file1LockedFav, file2LockedFav],
        testData.multipleSelAllFav.toolbarPrimary,
        testData.multipleSelAllFav.toolbarMore
      );
    });
  });
});