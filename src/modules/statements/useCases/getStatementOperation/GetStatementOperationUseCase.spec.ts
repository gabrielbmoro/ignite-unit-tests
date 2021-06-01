import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType } from "../../entities/Statement";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";
import { v4 as uuidV4 } from "uuid";
import { GetStatementOperationError } from "./GetStatementOperationError";

let getStatementOperationUseCase: GetStatementOperationUseCase;
let statementRepository: IStatementsRepository;
let userRepository: IUsersRepository;

describe("GetStatementOperationUseCase", () => {
  beforeEach(() => {
    statementRepository = new InMemoryStatementsRepository();
    userRepository = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      userRepository,
      statementRepository
    );
  });

  it("should be able to get the statement operation", async () => {
    const user = await userRepository.create({
      email: "test@test.com",
      name: "Test",
      password: "test1234",
    });
    const userId = user.id ? user.id : "-1";

    const statement = await statementRepository.create({
      amount: 12000,
      description: "salary",
      type: OperationType.DEPOSIT,
      user_id: userId,
    });
    const statementId = statement.id ? statement.id : "-1";

    const statementOperation = await getStatementOperationUseCase.execute({
      user_id: userId,
      statement_id: statementId,
    });

    expect(statementOperation).toHaveProperty("id");
    expect(statementOperation.amount).toEqual(12000);
  });

  it("should not be able to get the statement operation when the user doesn't exist", async () => {
    expect(async () => {
      const userId = uuidV4();

      const statement = await statementRepository.create({
        amount: 12000,
        description: "salary",
        type: OperationType.DEPOSIT,
        user_id: userId,
      });
      const statementId = statement.id ? statement.id : "-1";

      await getStatementOperationUseCase.execute({
        user_id: userId,
        statement_id: statementId,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it("should not be able to get the statement operation when the statement doesn't exist", async () => {
    expect(async () => {
      const user = await userRepository.create({
        email: "test@test.com",
        name: "Test",
        password: "test1234",
      });
      const userId = user.id ? user.id : "-1";

      const statementId = uuidV4();

      await getStatementOperationUseCase.execute({
        user_id: userId,
        statement_id: statementId,
      });
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });
});
