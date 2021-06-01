import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../repositories/IUsersRepository";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";
import { v4 as uuidV4 } from "uuid";
import { ShowUserProfileError } from "./ShowUserProfileError";

let showUserProfileUseCase: ShowUserProfileUseCase;
let userRepository: IUsersRepository;

describe("ShowUserProfileUseCase", () => {
  beforeEach(() => {
    userRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(userRepository);
  });

  it("should be able to fetch the user profile information using valid id", async () => {
    const user = await userRepository.create({
      email: "test@test.com",
      name: "test",
      password: "test1234",
    });

    const userId = user.id ? user.id : "-1";

    const profile = await showUserProfileUseCase.execute(userId);

    expect(profile).toHaveProperty("email");
    expect(profile).toHaveProperty("name");
  });

  it("should not be able to fetch the user profile information using invalid id", async () => {
    expect(async () => {
      await userRepository.create({
        email: "test@test.com",
        name: "test",
        password: "test1234",
      });

      const userId = uuidV4();

      await showUserProfileUseCase.execute(userId);
    }).rejects.toBeInstanceOf(ShowUserProfileError);
  });
});
