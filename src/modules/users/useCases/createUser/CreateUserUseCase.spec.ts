import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { CreateUserUseCase } from "./CreateUserUseCase";

let createUserUseCase: CreateUserUseCase;
let userRepository: IUsersRepository;

describe("CreateUserUseCase", () => {
  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(userRepository);
  });

  it("should be able to create a new user", async () => {
    await createUserUseCase.execute({
      name: "user test",
      email: "user@test.com",
      password: "test123",
    });

    const user = await userRepository.findByEmail("user@test.com");

    expect(user?.email).toBe("user@test.com");
  });

  it("should not be able to create a user when the email already exists", async () => {
    expect(async () => {
      await createUserUseCase.execute({
        name: "user test",
        email: "user@test.com",
        password: "test123",
      });

      await createUserUseCase.execute({
        name: "user test",
        email: "user@test.com",
        password: "test123",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
