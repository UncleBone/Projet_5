import { describe, it, expect, vi } from 'vitest';
import { PostService } from './post.service'; // adaptez le chemin si besoin
import { PostRepo } from '../repository/post.repo';
import { CreatePostSchema, CreateCommentSchema } from '../dto/post.dto';
import { faker } from '@faker-js/faker';

const ser = new PostService();

const fakeUser = {
  id: faker.number.int(),
  username: faker.internet.username(),
  email: faker.internet.email(),
  token: 'fake-token',
};

const fakePost = {
  id: faker.number.int(),
  title: faker.lorem.sentence(),
  content: faker.lorem.paragraph(),
  topic: faker.number.int(),
  author: fakeUser.id,
};

const fakeComment = {
  id: faker.number.int(),
  content: faker.lorem.sentence(),
  postId: fakePost.id,
  author: fakeUser.id,
};

describe('PostService', () => {
  describe('getAll', () => {
    it('récupère tous les posts pour un utilisateur donné', async () => {
      vi.spyOn(PostRepo.prototype, 'getAll').mockResolvedValue([fakePost]);

      const posts = await ser.getAll(fakeUser);

      expect(PostRepo.prototype.getAll).toHaveBeenCalledWith(fakeUser.id);
      expect(posts).toEqual([fakePost]);
    });
  });

  describe('getById', () => {
    it('récupère un post par son id', async () => {
      vi.spyOn(PostRepo.prototype, 'getById').mockResolvedValue(fakePost);

      const post = await ser.getById(fakePost.id);

      expect(PostRepo.prototype.getById).toHaveBeenCalledWith(fakePost.id);
      expect(post).toEqual(fakePost);
    });
  });

  describe('create', () => {
    it('crée un nouveau post après validation du schéma', async () => {
      vi.spyOn(CreatePostSchema, 'parse').mockImplementation((body) => body);
      const createSpy = vi.spyOn(PostRepo.prototype, 'create').mockResolvedValue(undefined); // create ne retourne rien

      const postData = {
        title: fakePost.title,
        content: fakePost.content,
        topic: String(fakePost.topic), // pour tester le cast Number(body.topic)
      };

      await ser.create(fakeUser.id, postData);

      expect(CreatePostSchema.parse).toHaveBeenCalledWith(postData);
      expect(createSpy).toHaveBeenCalledWith({
        ...postData,
        topic: Number(postData.topic),
        author: fakeUser.id,
      });
    });

    it('propage une erreur si le schéma n’est pas validé', async () => {
      const error = new Error('Validation error');
      vi.spyOn(CreatePostSchema, 'parse').mockImplementation(() => { throw error; });

      await expect(ser.create(fakeUser.id, {})).rejects.toThrow(error);
    });
  });

  describe('addComment', () => {
    it('ajoute un commentaire après validation du schéma', async () => {
      vi.spyOn(CreateCommentSchema, 'parse').mockImplementation((body) => body);
      const createCommentSpy = vi.spyOn(PostRepo.prototype, 'createComment').mockResolvedValue(undefined);

      const commentData = {
        content: fakeComment.content,
        postId: fakeComment.postId,
      };

      await ser.addComment(fakeUser.id, commentData);

      expect(CreateCommentSchema.parse).toHaveBeenCalledWith(commentData);
      expect(createCommentSpy).toHaveBeenCalledWith({
        ...commentData,
        author: fakeUser.id,
      });
    });

    it('propage une erreur si le schéma n’est pas validé', async () => {
      const error = new Error('Validation error');
      vi.spyOn(CreateCommentSchema, 'parse').mockImplementation(() => { throw error; });

      await expect(ser.addComment(fakeUser.id, {})).rejects.toThrow(error);
    });
  });
});