import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { hash } from "bcryptjs";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let userRepository: IUsersRepository;

describe("AuthenticateUserUseCase", () => {
  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(userRepository);
  });

  it("should be able to authenticate a valid user", async () => {
    const password = await hash("test1234", 0);

    await userRepository.create({
      name: "user test",
      email: "test@test.com",
      password,
    });

    const authentication = await authenticateUserUseCase.execute({
      email: "test@test.com",
      password: "test1234",
    });

    expect(authentication.token.length).toBeGreaterThan(0);
    expect(authentication.user.email).toEqual("test@test.com");
  });

  it("should not be able to authenticate an invalid password", async () => {
    expect(async () => {
      const password = await hash("test1234", 0);

      await userRepository.create({
        name: "user test",
        email: "test@test.com",
        password,
      });

      await authenticateUserUseCase.execute({
        email: "test@test.com",
        password: "test",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it("should not be able to authenticate an invalid email", async () => {
    expect(async () => {
      const password = await hash("test1234", 0);

      await userRepository.create({
        name: "user test",
        email: "test@test.com",
        password,
      });

      await authenticateUserUseCase.execute({
        email: "test@gmail.com",
        password: "test1234",
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });
});
