import generateTreeData from './generateTreeData';
import { TreeItemData } from '../types';
import { describe, expect, it } from '@jest/globals';
import { ZetkinMembership, ZetkinOrganization } from 'utils/types/zetkin';

describe('generateTreeData()', () => {
  it('creates an empty tree when there are not organizations or memberships', () => {
    const organizations: ZetkinOrganization[] = [];
    const memberships: ZetkinMembership[] = [];

    const expectedTreeData: TreeItemData[] = [];

    const treeData = generateTreeData(organizations, memberships);

    expect(treeData).toEqual(expectedTreeData);
  });

  it('creates flat list of unrelated organizations', () => {
    const organizations: ZetkinOrganization[] = [
      mockOrganization({
        id: 1,
        parent: null,
        title: 'Party A',
      }),
      mockOrganization({
        id: 2,
        parent: null,
        title: 'Party B',
      }),
    ];

    const memberships: ZetkinMembership[] = [
      mockMembership({
        organization: { id: 1, parent: null, title: 'Party A' },
        role: 'admin',
      }),
      mockMembership({
        organization: { id: 2, parent: null, title: 'Party B' },
        role: 'admin',
      }),
    ];

    const result = generateTreeData(organizations, memberships);

    const expectedTreeData: TreeItemData[] = [
      {
        children: [],
        id: 1,
        title: 'Party A',
      },
      {
        children: [],
        id: 2,
        title: 'Party B',
      },
    ];

    expect(result).toEqual(expectedTreeData);
  });

  it('ignores organizations without membership', () => {
    const organizations: ZetkinOrganization[] = [
      mockOrganization({
        id: 1,
        parent: null,
        title: 'Party A',
      }),
      mockOrganization({
        id: 2,
        parent: null,
        title: 'Party B',
      }),
    ];

    const memberships: ZetkinMembership[] = [
      mockMembership({
        organization: { id: 3, parent: null, title: 'Party C' },
        role: 'organizer',
      }),
      mockMembership({
        organization: { id: 4, parent: null, title: 'Party D' },
        role: 'admin',
      }),
      mockMembership({
        organization: { id: 5, parent: null, title: 'Party E' },
        role: null,
      }),
    ];

    const result = generateTreeData(organizations, memberships);

    const expectedTreeData: TreeItemData[] = [];

    expect(result).toEqual(expectedTreeData);
  });

  it('considers a child org a top org if the user doesnt have access to parent org', () => {
    const organizations: ZetkinOrganization[] = [
      mockOrganization({
        id: 1,
        parent: null,
        title: 'Party A',
      }),
      mockOrganization({
        id: 2,
        parent: {
          id: 1,
          title: 'Party A',
        },
        title: 'Party B',
      }),
    ];

    const memberships: ZetkinMembership[] = [
      mockMembership({
        organization: {
          id: 2,
          parent: {
            id: 1,
            title: 'Party A',
          },
          title: 'Party B',
        },
        role: 'organizer',
      }),
    ];

    const result = generateTreeData(organizations, memberships);

    const expectedTreeData: TreeItemData[] = [
      {
        children: [],
        id: 2,
        title: 'Party B',
      },
    ];

    expect(result).toEqual(expectedTreeData);
  });

  it('handles a missing organization without crashing', () => {
    const organizations: ZetkinOrganization[] = [];
    const memberships: ZetkinMembership[] = [
      mockMembership({
        organization: { id: 1, parent: null, title: 'Party A' },
        role: 'admin',
      }),
    ];

    const expectedTreeData: TreeItemData[] = [];

    const treeData = generateTreeData(organizations, memberships);

    expect(treeData).toEqual(expectedTreeData);
  });
});

function mockOrganization(
  organization: Pick<ZetkinOrganization, 'id' | 'title' | 'parent'>
): ZetkinOrganization {
  const injectedProperties = {
    avatar_file: null,
    country: 'SE',
    email: null,
    is_active: false,
    is_open: false,
    is_public: true,
    lang: null,
    parent: null,
    phone: null,
    slug: 'slug',
  };

  return { ...organization, ...injectedProperties };
}

function mockMembership(
  membership: Pick<ZetkinMembership, 'role'> & {
    organization: Pick<ZetkinOrganization, 'id' | 'title' | 'parent'>;
  }
): ZetkinMembership {
  return {
    follow: true,
    inherited: undefined,
    organization: mockOrganization(membership.organization),
    profile: { id: 112, name: 'Test profile' },
    role: membership.role,
  };
}
