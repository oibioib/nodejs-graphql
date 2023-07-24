import { PrismaClient } from '@prisma/client';
import DataLoader from 'dataloader';

import { UserSchemaType } from '../graphql-schemas/user/types.js';
import { ProfileSchemaType } from '../graphql-schemas/profile/types.js';
import { PostSchemaType } from '../graphql-schemas/post/types.js';
import { MemberSchemaType } from '../graphql-schemas/member-type/types.js';

export const userDataLoader = (prismaClient: PrismaClient) => {
  const dl = new DataLoader(async (ids: Readonly<string[]>) => {
    const users: UserSchemaType[] = await prismaClient.user.findMany({
      where: { id: { in: ids as string[] } },
      include: { userSubscribedTo: true, subscribedToUser: true },
    });

    const usersByIds = ids.map((id) => users.find((user) => user.id === id));

    return usersByIds;
  });

  return dl;
};

export const profileDataLoader = (prismaClient: PrismaClient) => {
  const dl = new DataLoader(async (ids: Readonly<string[]>) => {
    const profiles: ProfileSchemaType[] = await prismaClient.profile.findMany({
      where: { userId: { in: ids as string[] } },
    });

    const profilesByIds = ids.map((id) =>
      profiles.find((profile) => profile.userId === id),
    );

    return profilesByIds;
  });
  return dl;
};

export const postDataLoader = (prismaClient: PrismaClient) => {
  const dl = new DataLoader(async (ids: Readonly<string[]>) => {
    const posts: PostSchemaType[] = await prismaClient.post.findMany({
      where: { authorId: { in: ids as string[] } },
    });

    const postsByIds = ids.map((id) => posts.filter((post) => post.authorId === id));

    return postsByIds;
  });

  return dl;
};

export const memberTypeDataLoader = (prismaClient: PrismaClient) => {
  const dl = new DataLoader(async (ids: Readonly<string[]>) => {
    const memberTypes: MemberSchemaType[] = await prismaClient.memberType.findMany({
      where: { id: { in: ids as string[] } },
    });

    const memberTypesByIds = ids.map((id) =>
      memberTypes.find((memberType) => memberType.id === id),
    );

    return memberTypesByIds;
  });

  return dl;
};

const getDataLoaders = (prismaClient: PrismaClient) => {
  return {
    userDataLoader: userDataLoader(prismaClient),
    profileDataLoader: profileDataLoader(prismaClient),
    postDataLoader: postDataLoader(prismaClient),
    memberTypeDataLoader: memberTypeDataLoader(prismaClient),
  };
};

export default getDataLoaders;
